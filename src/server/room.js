class Room {
	constructor(code) {
		this.code = code;
		this.messages = [];
		this.users = [];

		this.options = {
			name: code
		};
	}

	addUser(user) {
		this.users.push(user);
	}

	addMessage(data) {
		this.messages.push(data);
	}
}

module.exports = Room;