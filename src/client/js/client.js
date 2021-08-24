const io = require("socket.io-client");

class Client {
	constructor() {
		this.socket = io();

		this.roomCode = undefined;
		this.username = undefined;

		this.socket.on("autoCode", code => {
			this.roomCode = code;
		});

		this.socket.on("clientRoomUpdate", room => {
			this.room = room;
		});
	}

	setUsername(username) {
		this.username = username;
		this.socket.emit("changeUsername", this.username);
	}

	join(code) {
		this.socket.emit("userJoin", code, {
			name: this.username
		});

		this.roomCode = code;
	}

	sendMessage(message) {
		if (this.roomCode) {
			this.socket.emit("sendMessage", this.roomCode, {
				userId: this.socket.id,
				username: this.username,
				timestamp: Date.now(),
				message
			});
		}
	}

	sendFile(file) {
		if (this.roomCode) {
			
		}
	}
}

const client = new Client();

module.exports = client;