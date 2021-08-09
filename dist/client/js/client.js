const io = require("socket.io-client");

class Client {
	constructor() {
		this.socket = io();

		this.socket.on("connect", () => {
			
		});
	}
}

const client = new Client();

module.exports = client;