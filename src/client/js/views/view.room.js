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
		hidden: false
	},
	methods: {
		show() {
			this.hidden = false;
		},
		hide() {
			this.hidden = true;
		},
		join() {
			let code = $("#roomCode").val();
			client.join(code);
			this.hide();
		}
	}
});

module.exports = roomApp;