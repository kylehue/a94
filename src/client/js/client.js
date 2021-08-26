const io = require("socket.io-client");
const utils = require("./../../lib/utils.js");

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
			let msgData = {
				userId: this.socket.id,
				username: this.username,
				timestamp: Date.now(),
				message
			};

			this.socket.emit("sendMessage", this.roomCode, msgData);
		}
	}

	sendFile(file) {
		let chunkSize = 10024;
		let activityId = utils.uid();

		console.log("SENDING THIS FILE");
		console.log(file);

		if (this.roomCode) {
			let reader = new FileReader();
			reader.readAsArrayBuffer(file);

			reader.onload = () => {
				let buffer = new Uint8Array(reader.result);

				let metadata = {
					name: file.name,
					type: file.type,
					size: file.size,
					lastModified: file.lastModified
				};

				let msgData = {
					userId: this.socket.id,
					username: this.username,
					timestamp: Date.now()
				};

				console.log(metadata);

				this.socket.emit("uploadStart", activityId, this.roomCode, msgData, metadata);

				this.socket.on("uploadNext" + activityId, (currentSize) => {
					let chunk = buffer.slice(currentSize, currentSize + chunkSize);
					this.socket.emit("uploadProgress" + activityId, chunk);
					//console.log(currentSize);
				});

				this.socket.on("uploadEnd" + activityId, () => {

				});
			}



			/*let reader = new FileReader();
			reader.readAsArrayBuffer(file);

			reader.onload = () => {
				let buffer = new Uint8Array(reader.result);
				let metadata = {
					name: file.name,
					type: file.type,
					size: file.size,
					lastModified: file.lastModified
				};

				let attachment = {
					buffer,
					metadata
				};

				let msgData = {
					userId: this.socket.id,
					username: this.username,
					timestamp: Date.now(),
					attachment
				};

				this.socket.emit("sendFile", this.roomCode, msgData);
			}*/
		}
	}
}

const client = new Client();

module.exports = client;