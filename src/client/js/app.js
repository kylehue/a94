//Modules
const events = require("../../lib/events.js");
const mouse = require("../../lib/mouse.js");
const key = require("../../lib/key.js");
const utils = require("../../lib/utils.js");
const config = require("../../lib/config.js");
const client = require("./client.js");
const streamsaver = require("streamsaver");

//Vue apps
const roomApp = require("./views/view.room.js");
const fileUploadApp = require("./views/view.fileUpload.js");
const tagList = require("./views/view.tagList.js");

//Public variables
const __development__ = true;

//Generate random username
function setRandomUsername() {
	let un = "user_" + utils.uid(4);
	$("#username").val(un);
	client.setUsername(un);
}

setRandomUsername();

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
	let msg = input.val();
	if (event.keyCode == 13 && !event.shiftKey) {
		event.preventDefault();

		if (tagList.hidden) {
			if (msg.length) {
				client.sendMessage(msg);
			}

			input.val("");
		} else {
			$("#tagList button.active").trigger("click");
		}

		input.trigger("input");
		autosize.update(input);
	} else if (event.keyCode == 38) {
		if (!tagList.hidden) {
			event.preventDefault();
			tagList.selectPrev();
		}
	} else if (event.keyCode == 40) {
		if (!tagList.hidden) {
			event.preventDefault();
			tagList.selectNext();
		}
	}
});

//Check if tagging
$("#composeMessage").on("click keyup keydown input", event => {
	const input = $(event.target);
	let value = input.val().replace(/\s/g, " ");
	let caret = input.caret();

	//Search for '@'
	let atIndex = undefined;
	for (var i = caret - 1; i >= 0; i--) {
		if (value[i] == "@") {
			atIndex = i;
			break;
		}

		//Abort search if there's a space
		if (value[i] == " ") {
			atIndex = undefined;
			break;
		}
	}

	//If there's an '@' before the caret...
	if (typeof atIndex == "number") {
		let hasSpaceBefore = value[atIndex - 1] == " ";

		//Show tag list if there's a space before the '@' OR the '@' is the first character of the message
		if (hasSpaceBefore || atIndex === 0) {
			let searchStr = value.substring(atIndex, caret).substr(1);

			tagList.show();
			tagList.search(searchStr);
		} else {
			tagList.hide();
		}

	} else {
		tagList.hide();
	}
});

//Check if typing
$("#composeMessage").on("input", event => {
	const input = $(event.target);
	let value = input.val();

	if (value.length) {
		client.typing();
	} else {
		client.afk();
	}
});

client.socket.on("typingUsersUpdate", userIds => {
	let stats = $("#stats p");
	$("#stats p").empty();

	if (userIds.includes(client.socket.id)) {
		userIds.splice(userIds.indexOf(client.socket.id), 1);
	}

	if (!userIds.length) return;

	if (userIds.length <= 3) {
		for (var i = 0; i < userIds.length; i++) {
			let userId = userIds[i];
			let user = findUserById(userId);

			if (user) {
				let span = $("<span>");
				span.addClass("userTag note");
				span.data("id", userId);
				span.text(user.text());

				stats.append(span);
			}

			if (i != userIds.length - 1) {
				stats.append(", ");
			} else {
				stats.append(" is");
			}
		}
	} else {
		stats.append("Several people are");
	}

	stats.append(" typing...");
});

//Hide taglist on body click
addEventListener("mousedown", event => {
	if (!_isDescendant(event.target, "#tagList") && event.target.id != "tagList") {
		tagList.hide();
	}
});

function addTag(id, name) {
	let wrapper = $("<div>");
	wrapper.addClass("tag flex row v-center");
	wrapper.data("id", id);

	let label = $("<label>");
	label.text(name);

	let closeIcon = $("<img>");
	closeIcon.attr("src", "assets/svg/cross-alt.svg");

	wrapper.append(label, closeIcon);

	wrapper.on("click", () => {
		wrapper.remove();
		$("#tags").trigger("change");
	});

	$("#tags .wrapper").append(wrapper);
	$("#tags").trigger("change");
}

events.on("tagUser", (id, name) => {
	let input = $("#composeMessage");
	let value = input.val();
	let caret = input.caret();

	//Delete tag text
	//Search for '@'
	let atIndex = undefined;
	for (var i = caret - 1; i >= 0; i--) {
		if (value[i] == "@") {
			atIndex = i;
			break;
		}
	}

	//If there's an '@' before the caret
	if (typeof atIndex == "number") {
		addTag(id, name);

		let left = value.substring(0, atIndex);
		let right = value.substring(caret);

		input.val(left + right);
		input.caret(atIndex);

		console.log(atIndex);

	}
});

//
addEventListener("unload", function() {
	if (writableStream) writableStream.abort();
});

function findUserById(id) {
	let users = $("#users .user");
	for (var i = 0; i < users.length; i++) {
		let user = $(users[i]);
		if (user.data("id") === id) {
			return user;
		}
	}
}

function isScrolledToBottom(el) {
	//https://stackoverflow.com/a/32283147/16446474
	let $el = $(el);
	return el.scrollHeight - $el.scrollTop() - $el.outerHeight() < 20;
}

//
function UI_addMessage(msgData, options) {
	options = options || {};

	//Don't add message is it begins with '/code' command
	if (msgData.message.startsWith(config.commands.changeRoomCode.cmd)) {
		return;
	}

	let _isScrolledToBottom = isScrolledToBottom($("#messages")[0]);

	let wrapper = $("<div>");
	wrapper.addClass("message flex col");
	wrapper.data("userId", msgData.userId);
	wrapper.data("messageId", msgData.id);

	if (msgData.type == "server") {
		wrapper.addClass("server");
	}

	let headWrapper = $("<div>");
	headWrapper.addClass("flex row v-center");

	let username = $("<p>");
	username.addClass("username");
	username.text(msgData.username);

	let timestamp = $("<p>");
	timestamp.addClass("timestamp");

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
	headWrapper.append(username, timestamp);

	//Check words for user ids
	let words = msgData.message.split(" ");
	let userIdRegex = /<@[a-zA-Z0-9-_]*>/g;
	let message = $("<p>");

	for (var i = 0; i < words.length; i++) {
		let word = words[i];
		if (userIdRegex.test(word)) {
			let id = word.replace("<@", "").replace(">", "");
			let user = findUserById(id);

			if (user) {
				let span = $("<span>");
				span.addClass("userTag");
				span.data("id", id);

				if (id === client.socket.id) {
					span.text(user.text() + " (YOU)");
				} else {
					span.text(user.text());
				}

				message.append(span);
			} else {
				message.append(word);
			}

		} else {
			message.append(word);
		}

		if (i != words.length - 1) {
			message.append(" ");
		}
	}

	wrapper.append(headWrapper, message);

	//Check mentions
	if (msgData.mentions) {
		if (msgData.mentions.length) {
			let tagsWrapper = $("<div>");
			tagsWrapper.addClass("tags flex row");

			let tagsParagraph = $("<p>");
			tagsParagraph.addClass("note");
			tagsParagraph.text("To: ");

			for (var i = 0; i < msgData.mentions.length; i++) {
				let mentionId = msgData.mentions[i];
				let username = undefined;

				//Find username using the mention id
				let users = $("#users .user");
				for (var j = 0; j < users.length; j++) {
					let user = $(users[j]);
					let id = user.data("id");
					if (id === mentionId) {
						username = user.text();
						break;
					}
				}

				if (mentionId === client.socket.id) {
					username += " (YOU)";
				}

				let tag = $("<span>");
				tag.data("id", mentionId);
				tag.addClass("userTag tag note");
				tag.text(username);
				tagsParagraph.append(tag);

				if (i != msgData.mentions.length - 1) {
					tagsParagraph.append(", ");
				}
			}

			tagsWrapper.append(tagsParagraph);
			wrapper.append(tagsWrapper);
		}

		//Highlight message if mentioned
		if (msgData.mentions.includes(client.socket.id)) {
			wrapper.addClass("mentioned");
		}
	}

	let messagesWrapper = $("#chatApp #messages");

	if (options.prepend) {
		messagesWrapper.prepend(wrapper);
	} else {
		messagesWrapper.append(wrapper);
	}

	if (options.maintainMaxMessages) {
		//Maintain max messages
		let messages = $("#messages .message");
		if (messages.length > config.maxMessages) {
			messages.first().remove();
		}
	}

	if (_isScrolledToBottom) {
		messagesWrapper.scrollTop($("#messages")[0].scrollHeight);
	}

	return wrapper;
}

// $("#messages").scroll(event => {
// 	let below = isScrolledToBottom(event.target);
// 	let above = event.target.scrollTop < 20;

// 	if (above) {
// 		let firstMessage = $("#messages .message").first();
// 		let firstMessageId = firstMessage.data("messageId");

// 		if (firstMessageId) {
// 			client.loadMessagesBefore(firstMessageId, config.maxMessages);
// 		} else {
// 			console.warn("Couldn't get first message id")
// 		}
// 	} else if (below) {
// 		let lastMessage = $("#messages .message").last();
// 		let lastMessageId = lastMessage.data("messageId");

// 		if (lastMessageId) {
// 			client.loadMessagesAfter(lastMessageId, config.maxMessages);
// 		} else {
// 			console.warn("Couldn't get first message id")
// 		}
// 	}
// });

// client.socket.on("deliverMessagesBefore", messages => {
// 	messages.sort((a, b) => a.timestamp - b.timestamp);

// 	console.log("deliverMessagesBefore");
// 	console.log(messages);

// 	let newMessagesHeight = 0;
// 	let firstEl;

// 	for (var i = messages.length - 1; i >= 0; i--) {
// 		let msgData = messages[i];
// 		let msgEl;

// 		if (msgData.attachment) {
// 			msgEl = addMessageFiles(msgData, {
// 				maintainMaxMessages: false,
// 				prepend: true
// 			});
// 		} else {
// 			msgEl = UI_addMessage(msgData, {
// 				prepend: true,
// 				maintainMaxMessages: false
// 			});
// 		}

// 		if (i == messages.length - 1) {
// 			firstEl = msgEl;
// 		}

// 		/*newMessagesHeight += $(msgEl).outerHeight(true);

// 		$("#messages .message").last().remove();*/
// 	}

// 	let targetScroll = firstEl.offset().top;
// 	if (targetScroll > 30) {
// 		$("#messages").scrollTop(targetScroll);
// 	}
// });

// client.socket.on("deliverMessagesAfter", messages => {
// 	messages.sort((a, b) => a.timestamp - b.timestamp);
// 	console.log("deliverMessagesAfter");
// 	console.log(messages);

// 	/*let newMessagesHeight = 0;

// 	for (var i = 0; i < messages.length; i++) {
// 		let msgData = messages[i];

// 		if (msgData.attachment) {
// 			addMessageFiles(msgData, {
// 				maintainMaxMessages: false
// 			});

// 		} else {
// 			let msgEl = UI_addMessage(msgData, {
// 				maintainMaxMessages: false
// 			});

// 			newMessagesHeight += $(msgEl).outerHeight(true);
// 		}

// 		//$("#messages .message").first().remove();
// 	}

// 	$("#messages").scrollTop($("#messages")[0].scrollHeight - $("#messages").outerHeight() - newMessagesHeight);*/
// });

window.spam = (count) => {
	count = count || 100;
	for (var i = 0; i < count; i++) {
		client.sendMessage(i.toString());
	}
}

function UI_addFile(msgData, file, options) {
	options = options || {};

	let _isScrolledToBottom = isScrolledToBottom($("#messages")[0]);

	let wrapper = $("<div>");
	wrapper.addClass("message flex col");
	wrapper.data("userId", msgData.userId);
	wrapper.data("messageId", msgData.id);

	let headWrapper = $("<div>");
	headWrapper.addClass("flex row v-center");

	let username = $("<p>");
	username.addClass("username");
	username.text(msgData.username);

	let timestamp = $("<p>");
	timestamp.addClass("timestamp");

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
	headWrapper.append(username, timestamp);

	let fileWrapper = $("<div>");
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

	let fileIcon = $("<img>");
	fileIcon.attr("src", "assets/svg/file.svg");

	let fileInfoWrapper = $("<div>");
	fileInfoWrapper.addClass("fileInfoWrapper flex col");

	let fileName = $("<label>");
	fileName.text(file.name);
	fileName.addClass("note file-name");

	let fileSize = $("<label>");
	fileSize.text(utils.bytesToSize(file.size));
	fileSize.addClass("note file-size");

	fileInfoWrapper.append(fileName, fileSize);
	fileWrapper.append(fileIcon, fileInfoWrapper);

	wrapper.append(headWrapper, fileWrapper);

	let messagesWrapper = $("#chatApp #messages");
	if (options.prepend) {
		messagesWrapper.prepend(wrapper);
	} else {
		messagesWrapper.append(wrapper);
	}

	if (options.maintainMaxMessages) {
		//Maintain max messages
		let messages = $("#messages .message");
		if (messages.length > config.maxMessages) {
			messages.first().remove();
		}
	}

	fileIcon.on("load", () => {
		if (_isScrolledToBottom) {
			$("#messages").scrollTop($("#messages")[0].scrollHeight);
		}
	});

	return wrapper;
}

function UI_addImage(msgData, imgURL, options) {
	options = options || {};

	let _isScrolledToBottom = isScrolledToBottom($("#messages")[0]);

	let wrapper = $("<div>");
	wrapper.addClass("message flex col");
	wrapper.data("userId", msgData.userId);
	wrapper.data("messageId", msgData.id);

	let headWrapper = $("<div>");
	headWrapper.addClass("flex row v-center");

	let username = $("<p>");
	username.addClass("username");
	username.text(msgData.username);

	let timestamp = $("<p>");
	timestamp.addClass("timestamp");

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
	headWrapper.append(username, timestamp);

	let image = $("<img>");
	image.attr("src", imgURL);

	image.on("click", () => {
		$("#overlay").removeClass("hidden");
		$("#imagePreviewApp").removeClass("hidden");
		$("#imagePreviewApp img").attr("src", imgURL);
	});

	wrapper.append(headWrapper, image);

	let messagesWrapper = $("#chatApp #messages");
	if (options.prepend) {
		messagesWrapper.prepend(wrapper);
	} else {
		messagesWrapper.append(wrapper);
	}

	if (options.maintainMaxMessages) {
		//Maintain max messages
		let messages = $("#messages .message");
		if (messages.length > config.maxMessages) {
			messages.first().remove();
		}
	}

	console.log("seifseoifesoifnesoifseofnsois")
	console.log(_isScrolledToBottom);

	image.on("load", () => {
		if (_isScrolledToBottom) {
			$("#messages").scrollTop($("#messages")[0].scrollHeight);
		}
	});

	return wrapper;
}

function UI_addVideo(msgData, vidURL, options) {
	options = options || {};

	let _isScrolledToBottom = isScrolledToBottom($("#messages")[0]);

	let wrapper = $("<div>");
	wrapper.addClass("message flex col");
	wrapper.data("userId", msgData.userId);
	wrapper.data("messageId", msgData.id);

	let headWrapper = $("<div>");
	headWrapper.addClass("flex row v-center");

	let username = $("<p>");
	username.addClass("username");
	username.text(msgData.username);

	let timestamp = $("<p>");
	timestamp.addClass("timestamp");

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
	headWrapper.append(username, timestamp);

	let video = $("<video>");
	video.attr("controls", "");

	let source = $("<source>");
	source.attr("src", vidURL);

	video.append(source);

	wrapper.append(headWrapper, video);

	let messagesWrapper = $("#chatApp #messages");
	if (options.prepend) {
		messagesWrapper.prepend(wrapper);
	} else {
		messagesWrapper.append(wrapper);
	}

	if (options.maintainMaxMessages) {
		//Maintain max messages
		let messages = $("#messages .message");
		if (messages.length > config.maxMessages) {
			messages.first().remove();
		}
	}

	video.on("load", () => {
		if (_isScrolledToBottom) {
			$("#messages").scrollTop($("#messages")[0].scrollHeight);
		}
	});

	return wrapper;
}

function UI_addAudio(msgData, audURL, options) {
	options = options || {};

	let _isScrolledToBottom = isScrolledToBottom($("#messages")[0]);

	let wrapper = $("<div>");
	wrapper.addClass("message flex col");
	wrapper.data("userId", msgData.userId);
	wrapper.data("messageId", msgData.id);

	let headWrapper = $("<div>");
	headWrapper.addClass("flex row v-center");

	let username = $("<p>");
	username.addClass("username");
	username.text(msgData.username);

	let timestamp = $("<p>");
	timestamp.addClass("timestamp");

	let msgTimestamp = new Date(msgData.timestamp).toLocaleTimeString();
	msgTimestamp = msgTimestamp.replace(/:[0-9]\d\s/, " ");
	timestamp.text(msgTimestamp);
	headWrapper.append(username, timestamp);

	let audio = $("<audio>");
	audio.attr("controls", "");

	let source = $("<source>");
	source.attr("src", audURL);

	audio.append(source);

	wrapper.append(headWrapper, audio);

	let messagesWrapper = $("#chatApp #messages");

	if (options.prepend) {
		messagesWrapper.prepend(wrapper);
	} else {
		messagesWrapper.append(wrapper);
	}

	if (options.maintainMaxMessages) {
		//Maintain max messages
		let messages = $("#messages .message");
		if (messages.length > config.maxMessages) {
			messages.first().remove();
		}
	}

	audio.on("load", () => {
		if (_isScrolledToBottom) {
			$("#messages").scrollTop($("#messages")[0].scrollHeight);
		}
	});

	return wrapper;
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
	let room = $("<button>");
	room.attr("id", code);
	room.data("code", code);
	room.addClass("select-item flex row v-center room");

	let roomIcon = $("<img>");
	roomIcon.attr("src", "assets/svg/chat-bubble.svg");

	let roomName = $("<span>");
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
		UI_addMessage(msg, {
			maintainMaxMessages: true
		});
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
	let userWrapper = $("<div>");
	userWrapper.addClass("user flex row v-center");
	userWrapper.data("id", userData.id);

	let userIcon = $("<img>");
	userIcon.addClass("user-icon");
	userIcon.attr("src", "assets/svg/user.svg");

	let username = $("<label>");
	username.addClass("username");
	username.text(userData.name);

	userWrapper.append(userIcon, username);

	if (userData.pending) {
		let confirmButton = $("<button>");
		confirmButton.addClass("validate confirm flex row center");

		let confirmButtonIcon = $("<img>");
		confirmButtonIcon.attr("src", "assets/svg/check-green.svg");

		confirmButton.append(confirmButtonIcon);

		let declineButton = $("<button>");
		declineButton.addClass("validate decline flex row center");

		let declineButtonIcon = $("<img>");
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

	//Update username in message mentions
	let tags = $(".userTag");
	for (var i = 0; i < tags.length; i++) {
		let tag = $(tags[i]);
		if (tag.data("id") === _user.id) {
			if (_user.id === client.socket.id) {
				tag.text(_user.name + " (YOU)");
			} else {
				tag.text(_user.name);
			}
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

function addMessageFiles(msgData, options) {
	let attachment = msgData.attachment;
	let metadata = attachment.metadata;
	let file = new File([attachment.buffer], metadata.name, {
		lastModified: metadata.lastModified,
		type: metadata.type
	});

	let url = URL.createObjectURL(file);

	if (file.type.startsWith("image")) {
		return UI_addImage(msgData, url, options);
	} else if (file.type.startsWith("video")) {
		return UI_addVideo(msgData, url, options);
	} else if (file.type.startsWith("audio")) {
		return UI_addAudio(msgData, url, options);
	} else {
		return UI_addFile(msgData, file, options);
	}

	console.log(file);
	console.log(msgData);
}

client.socket.on("updateMessages", messages => {
	console.log("updateMessages");
	$("#messages .message").remove();

	messages.sort((a, b) => a.timestamp - b.timestamp);

	for(var i = 0; i < messages.length; i++){
		messages.shift();
		if (i >= config.maxMessages) {
			break;
		}
	}

	for (var i = 0; i < messages.length; i++) {
		let msg = messages[i];

		if (msg.attachment) {
			addMessageFiles(msg, {
				maintainMaxMessages: true
			});
		} else {
			UI_addMessage(msg, {
				maintainMaxMessages: true
			});
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
	UI_addMessage(msgData, {
		maintainMaxMessages: true
	});
});

client.socket.on("serverMessage", msgData => {
	console.log("serverMessage");
	console.log(msgData);
	UI_addMessage(msgData, {
		maintainMaxMessages: true
	});
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

$("#tags").on("change", () => {
	let _isScrolledToBottom = isScrolledToBottom($("#messages")[0]);

	let tags = $("#tags .tag");
	if (!tags.length) {
		$("#tags").addClass("hidden");
	} else {
		$("#tags").removeClass("hidden");
	}

	let messagesWrapper = $("#messages");
	if (_isScrolledToBottom) {
		messagesWrapper.scrollTop(messagesWrapper[0].scrollHeight);
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
	if (event.shiftKey) {
		console.log(event.keyCode);
	}
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
 *Remove unnecessary fonts
 *Select box adjust position when getting blocked
 *Character limit
 *File size limit
 *Icons for room, add room, upload file btn, file icon, user, confirm, decline, no room icon
 *Logo
 */