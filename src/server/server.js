//Load modules
const Room = require("./room.js");
const config = require("./../lib/config.js");

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

function findUserIdsByRoomCode(code) {
	let userIds = [];

	for (var i = 0; i < rooms.length; i++) {
		let room = rooms[i];
		if (room.code === code) {
			for (var j = 0; j < room.users.length; j++) {
				let user = room.users[j];

				if (!userIds.includes(user.id)) {
					userIds.push(user.id);
				}
			}
		}
	}

	return userIds;
}

function sendServerMessage(roomCode, message, save) {
	let room = rooms.find(rm => rm.code === roomCode);

	if (room) {
		let msg = {
			type: "server",
			username: "Server",
			timestamp: Date.now(),
			message
		};

		io.in(room.code).emit("serverMessage", msg);

		if (save) {
			room.addMessage(msg);
		}
	}
}

io.on("connection", socket => {
	console.log(`${socket.id} has connected.`);

	socket.on("disconnect", () => {
		let userRooms = findRoomsByUserId(socket.id);
		for (var i = 0; i < userRooms.length; i++) {
			let room = userRooms[i];
			room.removeUser(socket.id);
			io.in(room.code).emit("updateUsers", room.users);
			io.in(room.code).emit("typingUsersUpdate", room.typingUsers);
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
		//First, check if the user is already in the room...
		let _user = room.getUser(socket.id);
		let user = _user;
		let isNewUser = false;

		if (!user) {
			//...if not, create a user instance
			user = {
				id: socket.id,
				name: userData.name,
				host: false,
				admin: false,
				pending: false
			};

			isNewUser = true;
		}

		//If the room is empty, the first person becomes the host
		if (!room.users.length) {
			user.host = true;
			user.admin = true;
			room.confirmUserId(socket.id);
		}

		if (room.options.locked) {
			if (!room.confirmedUsers.includes(user.id)) {
				user.pending = true;
			}
		} else {
			user.pending = false;
		}

		if (isNewUser) {
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

			//Notify people in the room that there's a new user
			if (isNewUser) {
				sendServerMessage(room.code, `<@${user.id}> has joined.`, true);
			}
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
						room.confirmUserId(pendingUser.id);

						io.to(pendingUser.id).emit("confirmedUser", room.code);
					}
				}
			}
		}
	});

	socket.on("reloadRoom", roomCode => {
		let room = rooms.find(rm => rm.code === roomCode);

		if (room) {
			io.in(room.code).emit("updateRoom", room);
			io.in(room.code).emit("updateUsers", room.users);
			io.in(room.code).emit("updateMessages", room.messages);
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
				io.in(room.code).emit("roomUsernameChange", user);
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
				if (user.host || user.admin) {
					let msgTrim = msgData.message.trim().toLowerCase();
					let serverMsg = {
						username: "Server",
						timestamp: Date.now(),
						message: "",
						type: "server"
					};

					//Help
					if (msgTrim == "/help") {
						let helpMsg = "";
						let commands = Object.values(config.commands);

						for (var i = 0; i < commands.length; i++) {
							let command = commands[i];

							helpMsg += !command.alt ? command.cmd : command.alt;
							helpMsg += " - " + command.description;

							//Add line break
							if (i != commands.length - 1) {
								helpMsg += "\n\n";
							}
						}

						serverMsg.message = helpMsg;
						socket.emit("serverMessage", serverMsg);
					}

					//Lock room
					if (msgTrim == config.commands.lockRoom.cmd) {
						room.options.locked = true;
						sendServerMessage(room.code, "Room is now locked.", true);
					}

					//Unlock room
					if (msgTrim == config.commands.unlockRoom.cmd) {
						room.options.locked = false;
						sendServerMessage(room.code, "Room is now unlocked.", true);

						for (var i = 0; i < room.users.length; i++) {
							let user = room.users[i];

							if (user.pending) {
								user.pending = false;

								room.confirmUserId(user.id);
								io.to(user.id).emit("confirmedUser", room.code);
							}
						}
					}

					//Change room name
					if (msgTrim.startsWith(config.commands.changeRoomName.cmd)) {
						let newName = msgTrim.split(" ");
						newName.shift();
						newName = newName.join(" ");
						if (newName) {
							if (newName.length) {
								newName.trim();
								room.options.name = newName;

								//Notify
								sendServerMessage(room.code, "Room name is set to '" + newName + "'", true);

								//Change clients' room UI text
								let userIds = findUserIdsByRoomCode(room.code);
								for (var i = 0; i < userIds.length; i++) {
									io.to(userIds[i]).emit("roomNameChange", room.code, room.options.name);
								}
							}
						}
					}

					//Change/Get room code
					if (user.host && msgTrim.startsWith(config.commands.changeRoomCode.cmd)) {
						let newCode = msgTrim.split(" ");
						newCode.shift();
						newCode = newCode.join(" ");
						if (newCode) {
							if (newCode.length) {
								if (room.code != newCode) {
									//Check if the new code is unique
									let roomCheck = rooms.find(rm => rm.code === newCode);
									let notUnique = false;
									if (roomCheck) {
										//If not, create another code
										newCode = getCode();
										notUnique = true;
									} else {
										codes.push(newCode);
									}

									//Change room code for UI datas
									let userIds = findUserIdsByRoomCode(room.code);
									for (var i = 0; i < userIds.length; i++) {
										io.to(userIds[i]).emit("roomCodeChange", room.code, newCode);
									}

									//Notify
									serverMsg.message = "Room code is set to " + newCode;

									if (notUnique) {
										serverMsg.message = "The code you indicated isn't unique. Room code is set to " + newCode;
									}

									socket.emit("serverMessage", serverMsg);

									room.code = newCode;
								} else {
									serverMsg.message = "Room code is already set to " + newCode;
									socket.emit("serverMessage", serverMsg);
								}
							}
						} else {
							serverMsg.message = "Room code is " + room.code;
							socket.emit("serverMessage", serverMsg);
						}
					}

					let mentions = msgData.mentions;

					if (mentions) {
						//Promote users
						if (msgTrim.startsWith(config.commands.promoteUser.cmd)) {
							for (var i = 0; i < mentions.length; i++) {
								let mentionId = mentions[i];
								let mentionedUser = room.getUser(mentionId);
								if (mentionedUser) {
									if (!mentionedUser.admin && !mentionedUser.host) {
										mentionedUser.admin = true;

										sendServerMessage(room.code, `<@${mentionedUser.id}> has been promoted to Admin.`, true);
									}
								}
							}
						}

						//Demote users
						if (msgTrim.startsWith(config.commands.demoteUser.cmd)) {
							for (var i = 0; i < mentions.length; i++) {
								let mentionId = mentions[i];
								let mentionedUser = room.getUser(mentionId);
								if (mentionedUser) {
									if (mentionedUser.admin && !mentionedUser.host) {
										mentionedUser.admin = false;

										sendServerMessage(room.code, `<@${mentionedUser.id}> has been demoted.`, true);
									}
								}
							}
						}

						//Kick users
						if (msgTrim.startsWith(config.commands.kickUser.cmd)) {
							for (var i = 0; i < mentions.length; i++) {
								let mentionId = mentions[i];
								let mentionedUser = room.getUser(mentionId);
								if (mentionedUser) {
									if (!mentionedUser.admin && !mentionedUser.host) {
										room.removeUser(mentionedUser.id);
										io.to(mentionedUser.id).emit("clientKicked", room.code);
										io.in(room.code).emit("updateUsers", room.users);

										//Notify kicked user
										serverMsg.message = "You have been kicked.";
										io.to(mentionedUser.id).emit("serverMessage", serverMsg);

										//Notify everyone
										sendServerMessage(room.code, `${mentionedUser.name} has been kicked.`, true);
									}
								}
							}
						}
					}
				}
			}
		}
	});

	socket.on("joinNewCode", (newCode, oldCode) => {
		let room = rooms.find(rm => rm.code === newCode);

		if (room) {
			socket.leave(oldCode);
			socket.join(newCode);
			//socket.emit("updateUsers", room.users);
			//socket.emit("updateMessages", room.messages);
		}
	});

	socket.on("userTyping", roomCode => {
		let room = rooms.find(rm => rm.code === roomCode);

		if (room) {
			room.addTypingUserId(socket.id);

			io.in(room.code).emit("typingUsersUpdate", room.typingUsers);
		}
	});

	socket.on("userAFK", roomCode => {
		let room = rooms.find(rm => rm.code === roomCode);

		if (room) {
			room.removeTypingUser(socket.id);

			io.in(room.code).emit("typingUsersUpdate", room.typingUsers);
		}
	});

	socket.on("leaveRoom", roomCode => {
		socket.leave(roomCode);
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







});