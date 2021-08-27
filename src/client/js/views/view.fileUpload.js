//Modules
const events = require("../../../lib/events.js");
const utils = require("../../../lib/utils.js");
const client = require("./../client.js");

let imageTypes = ["image/png", "image/jpeg", "image/gif"];

let _filesCache = [];

function addFile(type, id, previewSrc, filename) {
	let wrapper = $(document.createElement("div"));
	wrapper.addClass("filePreview");
	wrapper.data("id", id);
	wrapper.attr("title", filename);

	wrapper.on("click", event => {
		let file = _filesCache.find(f => f.id === wrapper.data("id"));

		if (file) {
			_filesCache.splice(_filesCache.indexOf(file), 1);
			wrapper.remove();

			if (!_filesCache.length) {
				fileUploadApp.hide();
			}
		}
	});

	let imagePreview = $(document.createElement("img"));
	if (type == "blob") {
		imagePreview.addClass("blobPreview");
		imagePreview.attr("src", "assets/svg/file.svg");
	} else {
		imagePreview.addClass("imagePreview");
		imagePreview.attr("src", previewSrc);
	}

	let previewName = $(document.createElement("p"));
	previewName.addClass("fileName");
	previewName.text(filename);

	let removeButton = $(document.createElement("button"));
	removeButton.addClass("default fileRemove");

	let removeButtonImage = $(document.createElement("img"));
	removeButtonImage.attr("src", "assets/svg/cross-alt.svg");

	removeButton.append(removeButtonImage);
	wrapper.append(imagePreview, previewName, removeButton);

	$("#filePreviews").append(wrapper);
}

//Create app
const fileUploadApp = new Vue({
	el: "#fileUploadApp",
	data: {
		hidden: true,
		fileName: "file",
		roomName: "room"
	},
	methods: {
		show() {
			this.hidden = false;
			this.$nextTick(() => {
				//Enable horizontal scrolling
				const filePreviews = document.querySelector("#filePreviews");
				filePreviews.addEventListener("mousewheel", event => {
					event.preventDefault();
					filePreviews.scrollLeft += event.deltaY;
				});
			});

			$("#overlay").removeClass("hidden");
		},
		hide() {
			this.hidden = true;

			$("#overlay").addClass("hidden");
		},
		ask(files, roomName) {
			if (!files.length) return;

			//Update files cache
			_filesCache = [];
			for(var i = 0; i < files.length; i++){
				_filesCache.push(files[i]);
			}

			//Create file name for dialog's title
			let fileName = "";
			let _fCount = Math.min(files.length, 5);
			for (var i = 0; i < _fCount; i++) {
				fileName += files[i].name;
				if (i < _fCount - 1) {
					fileName += ", ";
				}
			}

			this.fileName = fileName;
			this.roomName = roomName;
			this.show();
			this.$nextTick(() => {
				//Clear all file previews
				$("#filePreviews .filePreview").remove();

				//Create DOM file previews
				for (var i = 0; i < files.length; i++) {
					let file = files[i];
					file.id = utils.uid();
					let url = URL.createObjectURL(file);
					let type = file.type;
					if (!imageTypes.includes(type)) {
						type = "blob";
					}

					addFile(type, file.id, url, file.name);
				}
			});
		},
		upload() {
			for (var i = 0; i < _filesCache.length; i++) {
				let file = _filesCache[i];
				client.sendFile(file);
			}

			this.hide();
		}
	}
});

module.exports = fileUploadApp;