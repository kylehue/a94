const io = require("socket.io-client");
const utils = require("./../../lib/utils.js");

function UI_addUpload(fileId, fileName, progress) {
	let uploadWrapper = $(document.createElement("div"));
	uploadWrapper.addClass("upload flex row v-center");
	uploadWrapper.data("fileId", fileId);

	let uploadIcon = $(document.createElement("img"));
	uploadIcon.attr("src", "assets/svg/file.svg");

	let uploadInfoWrapper = $(document.createElement("div"));
	uploadInfoWrapper.addClass("upload-info flex col");

	let uploadName = $(document.createElement("label"));
	uploadName.addClass("note upload-name");
	uploadName.text(fileName);

	let uploadProgressWrapper = $(document.createElement("div"));
	uploadProgressWrapper.addClass("upload-progress-wrapper");

	let uploadProgress = $(document.createElement("div"));
	uploadProgress.addClass("upload-progress");
	uploadProgress.width(progress + "%");

	let uploadCancel = $(document.createElement("button"));
	uploadCancel.addClass("upload-cancel default flex center");

	uploadCancel.on("click", () => {
		uploadWrapper.data("destroy", true);
	});

	let uploadCancelIcon = $(document.createElement("img"));
	uploadCancelIcon.attr("src", "assets/svg/cross-alt.svg");

	uploadCancel.append(uploadCancelIcon);
	uploadProgressWrapper.append(uploadProgress);
	uploadInfoWrapper.append(uploadName, uploadProgressWrapper);
	uploadWrapper.append(uploadIcon, uploadInfoWrapper, uploadCancel);
	$("#uploadsWrapper").append(uploadWrapper);
	$("#uploadsWrapper").trigger("change");

	return uploadWrapper;
}

class Client {
	constructor() {
		this.socket = io();

		this.roomCode = undefined;
		this.username = undefined;

		this.socket.on("autoCode", code => {
			this.roomCode = code;
		});

		this.socket.on("updateRoom", room => {
			this.room = room;
		});

		this.socket.on("roomCodeChange", (oldCode, newCode) => {
			if (oldCode === this.roomCode) {
				this.roomCode = newCode;
				this.room.code = newCode;
				this.socket.emit("joinNewCode", newCode, oldCode);
			}
		});

		this.socket.on("confirmedUser", roomCode => {
			if (this.roomCode === roomCode) {
				this.socket.emit("joinNewCode", roomCode, "");
				this.socket.emit("reloadRoom", roomCode);
			}
		});
	}

	confirmUser(userId) {
		this.socket.emit("confirmUser", this.roomCode, userId);
	}

	declineUser(userId) {
		this.socket.emit("declineUser", this.roomCode, userId);
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

			//Get mentions
			let mentions = [];
			let mentionedUsers = $("#tags .tag");
			for(var i = 0; i < mentionedUsers.length; i++){
				let user = $(mentionedUsers[i]);
				let id = user.data("id");
				mentions.push(id);
			}

			//Clear mentions
			mentionedUsers.trigger("click");

			let msgData = {
				type: "client",
				userId: this.socket.id,
				username: this.username,
				timestamp: Date.now(),
				message,
				mentions
			};

			this.socket.emit("sendMessage", this.roomCode, msgData);
		}
	}

	sendFile(file) {
		let chunkSize = 10024;
		let uploadId = utils.uid();

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

				let uploadUI = UI_addUpload(uploadId, metadata.name, 0);

				this.socket.emit("uploadStart", uploadId, this.roomCode, msgData, metadata);

				this.socket.on("uploadNext" + uploadId, (currentSize) => {
					let chunk = buffer.slice(currentSize, currentSize + chunkSize);
					this.socket.emit("uploadProgress" + uploadId, chunk);

					let progress = ((currentSize / metadata.size) * 100) + "%";

					let uploads = $("#uploadsWrapper .upload");
					for (var i = 0; i < uploads.length; i++) {
						let upl = $(uploads[i]);
						if (upl.data("fileId") == uploadId) {
							upl.find(".upload-progress").width(progress);
						}

						if (upl.data("destroy")) {
							this.socket.emit("uploadDestroy" + uploadId);
						}
					}
				});

				this.socket.on("uploadFinish" + uploadId, () => {
					uploadUI.remove();
					$("#uploadsWrapper").trigger("change");
				});
			}
		}
	}
}

const client = new Client();

module.exports = client;