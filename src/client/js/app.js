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

$("#username").on("keydown", event => {
	if (event.keyCode == 13) {
		client.setUsername(event.target.value);
		$(event.target).blur();
	}
});

$("#composeMessage").on("keydown", event => {
	const input = $(event.target);
	if (event.keyCode == 13 && !event.shiftKey) {
		let msg = input.val();
		if (msg.length) client.sendMessage(msg);

		event.preventDefault();
		input.val("");
		input.trigger("input");
		autosize.update(input);
	}
});

//Generate random username
function setRandomUsername() {
	let un = "user_" + utils.uid(4);
	$("#username").val(un);
	client.setUsername(un);
}

setRandomUsername();

//
addEventListener("unload", function() {
	if (writableStream) writableStream.abort();
});

//
function UI_addMessage(msgData) {
	let wrapper = $(document.createElement("div"));
	wrapper.addClass("message flex col");
	wrapper.data("userId", msgData.userId);

	if (msgData.type == "server") {
		wrapper.addClass("server");
	}

	let headWrapper = $(document.createElement("div"));
	headWrapper.addClass("flex row v-center");

	let username = $(document.createElement("p"));
	username.addClass("username");
	username.text(msgData.username);

	let timestamp = $(document.createElement("p"));
	timestamp.addClass("timestamp");

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
	headWrapper.append(username, timestamp);

	let message = $(document.createElement("p"));
	message.text(msgData.message);
	wrapper.append(headWrapper, message);

	let messagesWrapper = $("#chatApp #messages");
	messagesWrapper.append(wrapper);
	messagesWrapper.scrollTop(messagesWrapper[0].scrollHeight);
}

function UI_addFile(msgData, file) {
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

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
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

function UI_addImage(msgData, imgURL) {
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

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
	headWrapper.append(username, timestamp);

	let image = $(document.createElement("img"));
	image.attr("src", imgURL);

	image.on("click", () => {
		$("#overlay").removeClass("hidden");
		$("#imagePreviewApp").removeClass("hidden");
		$("#imagePreviewApp img").attr("src", imgURL);
	});

	wrapper.append(headWrapper, image);

	let messagesWrapper = $("#chatApp #messages");
	messagesWrapper.append(wrapper);
	messagesWrapper.scrollTop(messagesWrapper[0].scrollHeight);
}

function UI_addVideo(msgData, vidURL) {
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

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
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

function UI_addAudio(msgData, audURL) {
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

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
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

function UI_addRoom(name, code) {
	//Check if the user already joined the room
	let existingRooms = $("#rooms .select-item");
	for (var i = 0; i < existingRooms.length; i++) {
		let rm = $(existingRooms[i]);

		if (rm.data("code") === code) {
			console.log("ROOM EXISTS!");
			console.log(code);
			return;
		}
	}

	console.log("ROOM DOESN'T EXIST!");
	console.log(code);

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
		UI_addMessage(msg);
	}

	//Clear users
	$("#users .user").remove();

	//Load users
	let users = roomData.users;
	for (var i = 0; i < users.length; i++) {
		let user = users[i];
		UI_addUser(user);
	}

	updateUserCount(users.length);
}

function updateUserCount(count) {
	$("#users #userCount").text(count);
}

function sortUsers() {
	//Sort users in dom
	//https://stackoverflow.com/a/25218104/16446474
	let clientUsers = $("#users .user").get();

	clientUsers.sort(function(el1, el2) {
		return $(el1).text().trim().localeCompare($(el2).text().trim())
	});

	$("#users .wrapper").append(clientUsers);
}

function UI_addUser(userData, ignoreAppend) {
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

	if (userData.pending) {
		let confirmButton = $(document.createElement("button"));
		confirmButton.addClass("validate confirm flex row center");

		let confirmButtonIcon = $(document.createElement("img"));
		confirmButtonIcon.attr("src", "assets/svg/check-green.svg");

		confirmButton.append(confirmButtonIcon);

		let declineButton = $(document.createElement("button"));
		declineButton.addClass("validate decline flex row center");

		let declineButtonIcon = $(document.createElement("img"));
		declineButtonIcon.attr("src", "assets/svg/cross-red.svg");

		declineButton.append(declineButtonIcon);

		userWrapper.append(confirmButton, declineButton);

		confirmButton.on("click", () => {
			client.confirmUser(userData.id);
			confirmButton.remove();
			declineButton.remove();
		});

		declineButton.on("click", () => {
			client.declineUser(userData.id);
			userWrapper.remove();
		});
	}

	if (!ignoreAppend) {
		$("#users .wrapper").append(userWrapper);
	}

	return userWrapper;
}

events.on("userJoin", code => {
	client.join(code);
	client.socket.once("autoCode", code => {

	});
});

//Update username
client.socket.on("roomUsernameChange", _user => {
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

	sortUsers();
});

//Add user
client.socket.on("updateUsers", serverUsers => {
	console.log("updateUsers", serverUsers);
	serverUsers.sort((a, b) => a.name - b.name);

	//Adding new users from server
	let clientUsers = $("#users .user");
	for (var i = 0; i < serverUsers.length; i++) {
		let serverUser = serverUsers[i];

		//Check if this user exists in dom...
		let exists = false;
		for (var j = 0; j < clientUsers.length; j++) {
			let clientUser = $(clientUsers[j]);
			if (clientUser.data("id") === serverUser.id) {
				exists = true;
			}
		}

		if (!exists) {
			//...if it doesn't exist, add it
			UI_addUser(serverUser);
		}
	}


	//Removing client users that isn't in the server
	clientUsers = $("#users .user");
	for (var i = 0; i < clientUsers.length; i++) {
		let clientUser = $(clientUsers[i]);

		//Check if client user exists in the server...
		let findUser = serverUsers.find(u => u.id === clientUser.data("id"));

		if (!findUser) {
			//...if it doesn't exist in the server users, remove it from dom
			clientUser.remove();
		}

	}

	sortUsers();
	updateUserCount(serverUsers.length);
});

function addMessageFiles(msgData) {
	let attachment = msgData.attachment;
	let metadata = attachment.metadata;
	let file = new File([attachment.buffer], metadata.name, {
		lastModified: metadata.lastModified,
		type: metadata.type
	});

	let url = URL.createObjectURL(file);

	if (file.type.startsWith("image")) {
		UI_addImage(msgData, url);
	} else if (file.type.startsWith("video")) {
		UI_addVideo(msgData, url);
	} else if (file.type.startsWith("audio")) {
		UI_addAudio(msgData, url);
	} else {
		UI_addFile(msgData, file);
	}

	console.log(file);
	console.log(msgData);
}

client.socket.on("updateMessages", messages => {
	console.log("updateMessages");
	$("#messages .message").remove();
	messages.sort((a, b) => a.timestamp - b.timestamp);
	for (var i = 0; i < messages.length; i++) {
		let msg = messages[i];

		if (msg.attachment) {
			addMessageFiles(msg);
		} else {
			UI_addMessage(msg);
		}
	}

	console.log(messages);
});

client.socket.on("newFile", addMessageFiles);

client.socket.on("updateRoom", roomData => {
	console.log("updateRoom");
	console.log(roomData);
	$("#lockOverlay").addClass("hidden");
	UI_addRoom(roomData.options.name, roomData.code);

	//Remove validation buttons
	let users = $("#users .user");
	for (var i = 0; i < users.length; i++) {
		let user = $(users[i]);
		if (user.data("id") === client.socket.id) {
			user.find("button.validate").remove();
			break;
		}
	}
	//enterRoom(roomData);
});

client.socket.on("updateRoomPending", roomData => {
	console.log("updateRoomPending");
	console.log(roomData)
	$("#lockOverlay").removeClass("hidden");
});

client.socket.on("newMessage", msgData => {
	console.log("newMessage");
	console.log(msgData)
	UI_addMessage(msgData);
});

client.socket.on("serverMessage", msgData => {
	console.log("serverMessage");
	console.log(msgData);
	UI_addMessage(msgData);
});

client.socket.on("roomNameChange", (roomCode, roomName) => {
	console.log("roomNameChange");
	console.log(roomCode, roomName);

	let roomsEl = $("#rooms");
	let rooms = roomsEl.find(".select-item");

	if (roomsEl.data("code") === roomCode) {
		roomsEl.find("label.select-value").text(roomName);
	}

	for (var i = 0; i < rooms.length; i++) {
		let room = $(rooms[i]);
		if (room.data("code") === roomCode) {
			room.find("span").text(roomName);

			break;
		}
	}
});

client.socket.on("roomCodeChange", (oldRoomCode, newRoomCode) => {
	console.log("roomCodeChange");

	let roomsEl = $("#rooms");
	let rooms = roomsEl.find(".select-item");

	if (roomsEl.data("code") === oldRoomCode) {
		roomsEl.data("code", newRoomCode);
	}

	for (var i = 0; i < rooms.length; i++) {
		let room = $(rooms[i]);
		if (room.data("code") === oldRoomCode) {

			console.log("ROOM BEFORE")
			console.log(room);
			//room.find("span").text(roomName);
			room.attr("id", newRoomCode);
			room.data("code", newRoomCode);

			console.log("ROOM AFTER")
			console.log(room);

			break;
		}
	}
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

$("#uploadsWrapper").on("change", () => {
	let uploads = $("#uploadsWrapper .upload");
	if (!uploads.length) {
		$("#uploadsList").addClass("hidden");
	} else {
		$("#uploadsList").removeClass("hidden");
	}
});

$("#overlay, #imagePreviewApp").on("click", () => {
	if (!$("#imagePreviewApp").hasClass("hidden")) {
		$("#imagePreviewApp").addClass("hidden");
		$("#overlay").addClass("hidden");
	}
});

//Enable drag and drop files
let lastDropTarget = null;

$(window).on("drop", event => {
	event.preventDefault();
	var dt = event.originalEvent.dataTransfer;
	if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
		let files = dt.files;
		fileUploadApp.ask(files, client.room.options.name);
	}

	$("#dropOverlay").css("visibility", "hidden");
});

$(window).on("dragenter", event => {
	var dt = event.originalEvent.dataTransfer;
	if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
		$("#dropOverlay").css("visibility", "visible");
		lastDropTarget = event.target;
	}
});

$(window).on("dragleave", event => {
	if (event.target == lastDropTarget || event.target == document) {
		$("#dropOverlay").css("visibility", "hidden");
	}
});

$(window).on("dragover", event => {
	event.preventDefault();
});

//Handle escape keys
window.addEventListener("keydown", event => {
	console.log(event.keyCode);
	let escapeKeyCodes = [27, 13, 32];
	if (escapeKeyCodes.includes(event.keyCode)) {
		$("#imagePreviewApp").addClass("hidden");
		$("#overlay").addClass("hidden");
	} else {
		console
		if (document.activeElement.tagName.toLowerCase() != "input") {
			$("#composeMessage").focus();
		}
	}
});

//TODO
/*
 *File messages inaccurate order
 *Progress bar on upload
 *Remove unnecessary fonts
 *Select box adjust position when getting blocked
 *Character limit
 *File size limit
 *Icons for room, add room, upload file btn, file icon, user, confirm, decline, no room icon
 *Logo
 */