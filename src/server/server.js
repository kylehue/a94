//Load modules
const Room = require("./room.js");

//Setup server
const express = require("express");
const socket = require("socket.io");
const app = express();
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});

//Setup io
const io = socket(server);
app.use(express.static(__dirname + "/../client"));

//Variables
let _lengthAuto = 0;

//Things
const codes = [];
const rooms = [];

//Functions
function getCode() {
	let length = 4;
	let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let code = "";

	function generateCode() {
		code = "";
		let len = _lengthAuto || length;
		for (var i = 0; i < len; i++) {
			code += chars[Math.floor(Math.random() * chars.length)];
		}
	}

	generateCode();

	let start = Date.now();
	while (codes.includes(code)) {
		if (Date.now() - start > 20) {
			_lengthAuto = !_lengthAuto ? length + 1 : _lengthAuto + 1;
		}

		generateCode();
	}

	codes.push(code);
	return code;
}

function findRoomsByUserId(userId) {
	let _rooms = [];
	for (var i = 0; i < rooms.length; i++) {
		let room = rooms[i];
		let user = room.users.find(u => u.id === userId);
		if (user) {
			_rooms.push(room);
		}
	}

	return _rooms;
}

io.on("connection", socket => {
	console.log(`${socket.id} has connected.`);

	socket.on("disconnect", () => {
		let userRooms = findRoomsByUserId(socket.id);
		for (var i = 0; i < userRooms.length; i++) {
			let room = userRooms[i];
			room.removeUser(socket.id);
			io.in(room.code).emit("removeUser", socket.id);
		}
	});

	socket.on("userJoin", (roomCode, userData) => {
		userData = userData || {};

		if (!roomCode) roomCode = getCode();

		let room = rooms.find(rm => rm.code === roomCode);

		//Create new room if the code is unique
		if (!room) {
			room = new Room(roomCode);
			rooms.push(room);

			socket.emit("autoCode", roomCode);
		}

		//Leave current rooms
		let _rooms = findRoomsByUserId(socket.id);
		for (var i = 0; i < _rooms.length; i++) {
			socket.leave(_rooms[i].code);
		}

		//Add user to room
		let _user = room.users.find(u => u.id === socket.id);

		let user = {
			id: socket.id,
			name: userData.name,
			admin: false,
			pending: false
		};

		if (_user) {
			user = _user;
		}

		if (!room.users.length) {
			user.admin = true;
			room.confirmedUsers.push(socket.id);
		}

		if (room.options.locked) {
			if (!room.confirmedUsers.includes(user.id)) {
				user.pending = true;
			}
		} else {
			user.pending = false;
		}

		if (!_user) {
			room.addUser(user);
		}

		console.log("-------------USER:");
		console.log(user);
		console.log("......................................");

		socket.to(room.code).emit("updateUsers", room.users);
		socket.emit("updateRoom", room);

		if (!user.pending) {
			socket.join(room.code);
			socket.emit("updateUsers", room.users);
			socket.emit("updateMessages", room.messages);
		} else {
			socket.emit("updateRoomPending", room);
		}

		console.log(room);
	});

	socket.on("confirmUser", (roomCode, userId) => {
		let room = rooms.find(rm => rm.code === roomCode);

		if (room) {
			let user = room.getUser(socket.id);

			if (user) {
				if (user.admin) {
					let pendingUser = room.getUser(userId);
					if (pendingUser) {
						pendingUser.pending = false;

						room.confirmedUsers.push(pendingUser.id);
						io.in(room.code).to(pendingUser.id).emit("updateUsers", room.users);
						io.in(room.code).to(pendingUser.id).emit("updateMessages", room.messages);
						io.in(room.code).to(pendingUser.id).emit("updateRoom", room);
					}
				}
			}
		}
	});

	socket.on("changeUsername", username => {
		let userRooms = findRoomsByUserId(socket.id);
		for (var i = 0; i < userRooms.length; i++) {
			let room = userRooms[i];

			//Update users
			let user = room.users.find(u => u.id === socket.id);
			if (user) {
				user.name = username;
				io.in(room.code).emit("updateUser", user);
			}

			//Update messages username
			for (var j = 0; j < room.messages.length; j++) {
				let msg = room.messages[j];
				if (msg.userId === socket.id) {
					msg.username = user.name
				}
			}
		}
	});

	socket.on("sendMessage", (roomCode, msgData) => {
		let room = rooms.find(rm => rm.code === roomCode);

		console.log(roomCode, msgData);

		if (room) {
			let user = room.getUser(socket.id);

			room.addMessage(msgData);
			io.in(room.code).emit("newMessage", msgData);

			//Check if the message is a command
			if (user) {
				if (user.admin) {
					let msgTrim = msgData.message.trim().toLowerCase();
					let serverMsg = {
						username: "Server",
						timestamp: Date.now(),
						message: "",
						type: "server"
					};

					let sendMsg = false;

					if (msgTrim == "/lock") {
						room.options.locked = true;
						sendMsg = true;
						serverMsg.message = "Room is now locked.";
					}

					if (msgTrim == "/unlock") {
						room.options.locked = false;
						sendMsg = true;
						serverMsg.message = "Room is now unlocked.";

						for (var i = 0; i < room.users.length; i++) {
							let user = room.users[i];
							user.pending = false;

							room.confirmedUsers.push(user.id);
							io.in(room.code).to(user.id).emit("updateMessages", room.messages);
							io.in(room.code).to(user.id).emit("updateRoom", room);
						}
					}

					if (sendMsg) {
						io.in(room.code).emit("serverMessage", serverMsg);
						room.addMessage(serverMsg);
					}
				}
			}
		}
	});

	socket.on("uploadStart", (uploadId, roomCode, msgData, metadata) => {
		let room = rooms.find(rm => rm.code === roomCode);

		if (room) {
			let file = room.createFile(metadata);
			let destroyed = false;

			socket.on("uploadDestroy" + uploadId, () => {
				destroyed = true;
				socket.emit("uploadFinish" + uploadId);
			});

			socket.emit("uploadNext" + uploadId, file.size);
			socket.on("uploadProgress" + uploadId, chunk => {
				if (destroyed) return;

				file.addChunk(chunk);

				if (file.size < file.metadata.size) {
					console.log("UPLOADING " + uploadId + "...");
					socket.emit("uploadNext" + uploadId, file.size);
				} else {
					console.log("UPLOADED " + uploadId + "!");
					let attachment = {
						buffer: new Uint8Array(file.buffer),
						metadata
					};

					msgData.attachment = attachment;
					msgData.timestamp = Date.now();

					room.addMessage(msgData);
					io.in(room.code).emit("newFile", msgData);
					socket.emit("uploadFinish" + uploadId);
				}
			});
		}
	});

	/*const ss = require("socket.io-stream");
	const fs = require("fs");

	socket.on("sendFile", (roomCode, msgData) => {
		var stream = ss.createStream();
		stream.on("end", function(e) {
			console.log("file sent");
			console.log(e);
		});

		ss(socket).emit("sending", stream);
		fs.createReadStream(msgData.attachment.metadata.name).pipe(stream);
	});*/

	/*socket.on("sendFile", (roomCode, msgData) => {
		let room = rooms.find(rm => rm.code === roomCode);

		console.log(roomCode, msgData);

		if (room) {
			room.addMessage(msgData);
			io.in(room.code).emit("newFile", msgData);
		}
	});*/









});