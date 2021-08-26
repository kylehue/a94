//Modules
const events = require("../../lib/events.js");
const mouse = require("../../lib/mouse.js");
const key = require("../../lib/key.js");
const utils = require("../../lib/utils.js");
const client = require("./client.js");
const streamsaver = require("streamsaver");

//Vue apps
const roomApp = require("./views/view.room.js");
const fileUploadApp = require("./views/view.fileUpload.js");

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

addEventListener("unload", function() {
	if (writableStream) writableStream.abort();
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

function addFile(msgData, file) {
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

	let fileWrapper = $(document.createElement("div"));
	fileWrapper.addClass("file flex row v-center");
	fileWrapper.attr("title", file.name);

	fileWrapper.on("click", () => {
		try {
			let blob = new Blob([file]);
			const fileStream = streamsaver.createWriteStream(`${file.name}`, {
				size: blob.size
			});

			const readableStream = blob.stream();
			if (window.WritableStream && readableStream.pipeTo) {
				return readableStream.pipeTo(fileStream);
			}

		} catch (e) {
			console.warn(e);
		}
	});

	let fileIcon = $(document.createElement("img"));
	fileIcon.attr("src", "assets/svg/file.svg");

	let fileInfoWrapper = $(document.createElement("div"));
	fileInfoWrapper.addClass("fileInfoWrapper flex col");

	let fileName = $(document.createElement("label"));
	fileName.text(file.name);
	fileName.addClass("note file-name");

	let fileSize = $(document.createElement("label"));
	fileSize.text(utils.bytesToSize(file.size));
	fileSize.addClass("note file-size");

	fileInfoWrapper.append(fileName, fileSize);
	fileWrapper.append(fileIcon, fileInfoWrapper);

	wrapper.append(headWrapper, fileWrapper);

	let messagesWrapper = $("#chatApp #messages");
	messagesWrapper.append(wrapper);
	messagesWrapper.scrollTop(messagesWrapper[0].scrollHeight);
}

function addImage(msgData, imgURL) {
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

	let image = $(document.createElement("img"));
	image.attr("src", imgURL);

	wrapper.append(headWrapper, image);

	let messagesWrapper = $("#chatApp #messages");
	messagesWrapper.append(wrapper);
	messagesWrapper.scrollTop(messagesWrapper[0].scrollHeight);
}

function addVideo(msgData, vidURL) {
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

	let video = $(document.createElement("video"));
	video.attr("controls", "");

	let source = $(document.createElement("source"));
	source.attr("src", vidURL);

	video.append(source);

	wrapper.append(headWrapper, video);

	let messagesWrapper = $("#chatApp #messages");
	messagesWrapper.append(wrapper);
	messagesWrapper.scrollTop(messagesWrapper[0].scrollHeight);
}

function addAudio(msgData, audURL) {
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

	let audio = $(document.createElement("audio"));
	audio.attr("controls", "");

	let source = $(document.createElement("source"));
	source.attr("src", audURL);

	audio.append(source);

	wrapper.append(headWrapper, audio);

	let messagesWrapper = $("#chatApp #messages");
	messagesWrapper.append(wrapper);
	messagesWrapper.scrollTop(messagesWrapper[0].scrollHeight);
}

function addRoom(name, code) {
	//Check if the user already joined the room
	let existingRooms = $("#rooms .select-item");
	for (var i = 0; i < existingRooms.length; i++) {
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
	for (var i = 0; i < messages.length; i++) {
		let msg = messages[i];
		addMessage(msg);
	}

	//Clear users
	$("#users .user").remove();

	//Load users
	let users = roomData.users;
	for (var i = 0; i < users.length; i++) {
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
	for (var i = 0; i < users.length; i++) {
		let user = $(users[i]);
		if (user.data("id") === userId) {
			user.remove();
		}
	}
});

client.socket.on("updateUser", _user => {
	//Update username in users pane
	let users = $("#users .user");
	for (var i = 0; i < users.length; i++) {
		let user = $(users[i]);
		if (user.data("id") === _user.id) {
			user.find(".username").text(_user.name);
		}
	}

	//Update username in chat app
	let messages = $("#messages .message");
	for (var i = 0; i < messages.length; i++) {
		let msg = $(messages[i]);
		if (msg.data("userId") === _user.id) {
			msg.find(".username").text(_user.name);
		}
	}
})

client.socket.on("updateUsers", users => {
	$("#users .user").remove();
	users.sort((a, b) => a.name - b.name);
	for (var i = 0; i < users.length; i++) {
		let user = users[i];
		addUser(user);
	}

	updateUserCount(users.length);
});

client.socket.on("updateMessages", messages => {
	$("#messages .message").remove();
	messages.sort((a, b) => a.timestamp - b.timestamp);
	for (var i = 0; i < messages.length; i++) {
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

$("#fileInput").on("change", event => {
	let files = $("#fileInput")[0].files;
	fileUploadApp.ask(files, client.room.options.name);
	console.log(files);
});

client.socket.on("newFile", msgData => {
	let attachment = msgData.attachment;
	let metadata = attachment.metadata;
	let file = new File([attachment.buffer], metadata.name, {
		lastModified: metadata.lastModified,
		type: metadata.type
	});

	let url = URL.createObjectURL(file);

	if (file.type.startsWith("image")) {
		addImage(msgData, url);
	} else if (file.type.startsWith("video")) {
		addVideo(msgData, url);
	} else if (file.type.startsWith("audio")) {
		addAudio(msgData, url);
	} else {
		addFile(msgData, file);
	}

	console.log(file);
	console.log(msgData);
});
/*
client.socket.on("test", attachment => {
	let metadata = attachment.metadata;
	attachment.buffer = new Uint8Array(attachment.buffer);
	let file = new File([attachment.buffer], metadata.name, {
		lastModified: metadata.lastModified,
		type: metadata.type
	});

	addFile({}, file);

	console.log("ATTACHMENT")
	console.log(attachment);
	console.log("FILE")
	console.log(file);
})
*/
//TODO
/*
 *Load blob messages by using their ids
 *Ping server every 5mins
 *Remove unnecessary fonts
 *Select box adjust position when getting blocked
 *Character limit
 *File size limit
 *Icons for room, add room, upload file btn, file icon, user, confirm, decline, no room icon
 *Logo
 */