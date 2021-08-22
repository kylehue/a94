class Room {
	constructor(code) {
		this.code = code;
		this.messages = [];
		this.users = [];

		this.options = {
			name: code
		};
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
}

module.exports = Room;