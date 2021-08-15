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
	let length = 6;
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

io.on("connection", socket => {
	console.log(`${socket.id} has connected.`);

	socket.on("userJoin", data => {
		data = data || {};

		if (!data.code) data.code = getCode();

		let room = rooms.find(rm => rm.code === data.code);

		//Create new room if the code is unique
		if (!room) {
			room = new Room(data.code);
			rooms.push(room);

			socket.emit("autoCode", data.code);
		}

		socket.join(data.code);

		let user = {
			id: socket.id,
			name: data.name
		};

		room.addUser(user);

		console.log(room);
	});

	socket.on("sendMessage", (roomCode, msgData) => {
		let room = rooms.find(rm => rm.code === roomCode);

		console.log(roomCode, msgData);

		if (room) {
			room.addMessage(msgData);
			io.in(room.code).emit("newMessage", msgData);
		}
	});
});