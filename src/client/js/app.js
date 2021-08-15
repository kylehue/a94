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

function addMessage(msgData) {
	let wrapper = $(document.createElement("div"));
	wrapper.addClass("message flex col");

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

client.socket.on("newMessage", msgData => {
	console.log(msgData)
	addMessage(msgData);
});

//TODO
/*
*Ping server every 5mins
*Remove unnecessary fonts
*Select box adjust position when getting blocked
*Icons for room, add room, upload file btn, file icon, user, confirm, decline, no room icon
*Logo
*/

