//Modules
const events = require("../../lib/events.js");
const mouse = require("../../lib/mouse.js");
const key = require("../../lib/key.js");
const utils = require("../../lib/utils.js");
const client = require("./client.js");

//Vue apps
const roomApp = require("./views/view.room.js");

//Public variables
const __development__ = true;

//UI events
$("#createRoom").on("click", () => {
	roomApp.show();
});

$("#username").on("focusout", event => {
	client.setUsername(event.target.value);
});

$("#composeMessage").on("keydown", event => {
	const input = $(event.target);
	if (event.keyCode == 13 && !event.shiftKey) {
		client.sendMessage(input.val());

		event.preventDefault();
		input.val("");
		input.trigger("input");
		autosize.update(input);
	}
});

//
function addMessage(msgData) {
	let wrapper = $(document.createElement("div"));
	wrapper.addClass("message flex col");
	wrapper.data("userId", msgData.userId);

	let headWrapper = $(document.createElement("div"));
	headWrapper.addClass("flex row v-center");

	let username = $(document.createElement("p"));
	username.addClass("username");
	username.text(msgData.username);

	let timestamp = $(document.createElement("p"));
	timestamp.addClass("timestamp");

	msgData.timestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgData.timestamp = msgData.timestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgData.timestamp);
	headWrapper.append(username, timestamp);

	let message = $(document.createElement("p"));
	message.text(msgData.message);
	wrapper.append(headWrapper, message);

	let messagesWrapper = $("#chatApp #messages");
	messagesWrapper.append(wrapper);
	messagesWrapper.scrollTop(messagesWrapper[0].scrollHeight);
}

function addRoom(name, code) {
	//Check if the user already joined the room
	let existingRooms = $("#rooms .select-item");
	for(var i = 0; i < existingRooms.length; i++){
		let rm = $(existingRooms[i]);

		if (rm.data("code") === code) {
			return;
		}
	}

	//Add in UI
	let room = $(document.createElement("button"));
	room.attr("id", code);
	room.data("code", code);
	room.addClass("select-item flex row v-center room");

	let roomIcon = $(document.createElement("img"));
	roomIcon.attr("src", "assets/svg/chat-bubble.svg");

	let roomName = $(document.createElement("span"));
	roomName.text(name);

	room.append(roomIcon, roomName);
	$("#rooms .select-itemWrapper").append(room);
	room.on("mousedown", _addSelectItemEvent);

	room.trigger("mousedown");
}

function enterRoom(roomData) {
	//Clear messages
	$("#chatApp #messages .message").remove();

	//Load messages
	let messages = roomData.messages;
	for(var i = 0; i < messages.length; i++){
		let msg = messages[i];
		addMessage(msg);
	}

	//Clear users
	$("#users .user").remove();

	//Load users
	let users = roomData.users;
	for(var i = 0; i < users.length; i++){
		let user = users[i];
		addUser(user);
	}

	updateUserCount(users.length);
}

function updateUserCount(count) {
	$("#users #userCount").text(count);
}

function addUser(userData) {
	let userWrapper = $(document.createElement("div"));
	userWrapper.addClass("user flex row v-center");
	userWrapper.data("id", userData.id);

	let userIcon = $(document.createElement("img"));
	userIcon.addClass("user-icon");
	userIcon.attr("src", "assets/svg/user.svg");

	let username = $(document.createElement("label"));
	username.addClass("username");
	username.text(userData.name);

	userWrapper.append(userIcon, username);
	$("#users .wrapper").append(userWrapper);
}

events.on("userJoin", code => {
	client.join(code);
	client.socket.once("autoCode", code => {
		
	});
});

client.socket.on("removeUser", userId => {
	let users = $("#users .user");
	for(var i = 0; i < users.length; i++){
		let user = $(users[i]);
		if (user.data("id") === userId) {
			user.remove();
		}
	}
});

client.socket.on("updateUser", _user => {
	//Update username in users pane
	let users = $("#users .user");
	for(var i = 0; i < users.length; i++){
		let user = $(users[i]);
		if (user.data("id") === _user.id) {
			user.find(".username").text(_user.name);
		}
	}

	//Update username in chat app
	let messages = $("#messages .message");
	for(var i = 0; i < messages.length; i++){
		let msg = $(messages[i]);
		if (msg.data("userId") === _user.id) {
			msg.find(".username").text(_user.name);
		}
	}
})

client.socket.on("updateUsers", users => {
	$("#users .user").remove();
	users.sort((a, b) => a.name - b.name);
	for(var i = 0; i < users.length; i++){
		let user = users[i];
		addUser(user);
	}

	updateUserCount(users.length);
});

client.socket.on("updateMessages", messages => {
	$("#messages .message").remove();
	messages.sort((a, b) => a.timestamp - b.timestamp);
	for(var i = 0; i < messages.length; i++){
		let msg = messages[i];
		addMessage(msg);
	}

	console.log(messages);
});

client.socket.on("updateRoom", roomData => {
	console.log(roomData)
	addRoom(roomData.options.name, roomData.code);
	//enterRoom(roomData);
});

client.socket.on("newMessage", msgData => {
	console.log(msgData)
	addMessage(msgData);
});

$("#rooms").on("change", event => {
	let code = $("#rooms").data("code");
	client.join(code);
});

//TODO
/*
*Ping server every 5mins
*Remove unnecessary fonts
*Select box adjust position when getting blocked
*Icons for room, add room, upload file btn, file icon, user, confirm, decline, no room icon
*Logo
*/

