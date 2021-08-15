const io = require("socket.io-client");

class Client {
	constructor() {
		this.socket = io();

		this.roomCode = undefined;
		this.username = undefined;

		this.socket.on("autoCode", code => {
			this.roomCode = code;
		});
	}

	setUsername(username) {
		this.username = username;
	}

	join(code) {
		this.socket.emit("userJoin", {
			code
		});

		this.roomCode = code;
	}

	sendMessage(message) {
		if (this.roomCode) {
			this.socket.emit("sendMessage", this.roomCode, {
				username: this.username,
				timestamp: Date.now(),
				message
			});
		}
	}
}

const client = new Client();

module.exports = client;