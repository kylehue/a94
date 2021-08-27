//Modules
const events = require("../../../lib/events.js");
const client = require("./../client.js");

//Functions
function createCode() {
	let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let code = "";
	for(var i = 0; i < 6; i++){
		code += chars[Math.floor(Math.random() * chars.length)];
	}

	return code;
}

//Create app
const roomApp = new Vue({
	el: "#roomApp",
	data: {
		hidden: true
	},
	methods: {
		show() {
			this.hidden = false;
			this.$nextTick(() => {
				$("#roomCode").focus();

				$("#roomCode").on("keydown", event => {
					if (event.keyCode == 13) {
						this.join();
					}
				});
			});

			$("#overlay").removeClass("hidden");
		},
		hide() {
			this.hidden = true;

			$("#overlay").addClass("hidden");
		},
		join() {
			let code = $("#roomCode").val();
			events.emit("userJoin", code);
			this.hide();
		}
	}
});

module.exports = roomApp;