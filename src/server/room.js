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
		this.confirmedUsers = [];
		this.typingUsers = [];

		this.options = {
			name: code,
			locked: false
		};

		this.files = [];
	}

	removeUser(userId) {
		let user = this.users.find(u => u.id === userId);
		if (user) {
			this.users.splice(this.users.indexOf(user), 1);
		}

		let confirmedUser = this.confirmedUsers.find(u => u === userId);
		if (confirmedUser) {
			this.confirmedUsers.splice(this.confirmedUsers.indexOf(confirmedUser), 1);
		}

		this.removeTypingUser(userId);
	}

	addTypingUserId(userId) {
		if (!this.typingUsers.includes(userId)) {
			this.typingUsers.push(userId);
		}
	}

	removeTypingUser(userId) {
		let typingUser = this.typingUsers.find(u => u === userId);
		if (typingUser) {
			this.typingUsers.splice(this.typingUsers.indexOf(typingUser), 1);
		}
	}

	confirmUserId(userId) {
		if (!this.confirmedUsers.includes(userId)) {
			this.confirmedUsers.push(userId);
		}
	}

	addUser(user) {
		this.users.push(user);
	}

	getUser(userId) {
		let user = this.users.find(u => u.id === userId);
		if (user) {
			return user;
		}
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