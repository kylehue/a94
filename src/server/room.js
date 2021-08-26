const utils = require("./../lib/utils.js");

class RoomFile {
	constructor(metadata) {
		this.id = utils.uid();
		this.buffer = [];
		this.metadata = metadata || {};
		this.size = 0;
	}

	addChunk(chunk) {
		for(var i = 0; i < chunk.length; i++){
			this.buffer.push(chunk[i]);
		}

		this.size += chunk.length;
	}
}

class Room {
	constructor(code) {
		this.code = code;
		this.messages = [];
		this.users = [];

		this.options = {
			name: code
		};

		this.files = [];
	}

	removeUser(userId) {
		let user = this.users.find(u => u.id === userId);
		if (user) {
			this.users.splice(this.users.indexOf(user), 1);
		}
	}

	addUser(user) {
		this.users.push(user);
	}

	addMessage(data) {
		this.messages.push(data);
	}

	createFile(metadata) {
		let file = new RoomFile(metadata);

		return file;
	}
}

module.exports = Room;