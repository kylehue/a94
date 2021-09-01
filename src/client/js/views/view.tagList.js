//Modules
const events = require("../../../lib/events.js");

function addTag(id, name) {
	let button = $(document.createElement("button"));
	button.addClass("default flex row v-center");
	button.data("id", id);

	let icon = $(document.createElement("img"));
	icon.attr("src", "assets/svg/user.svg");

	let text = $(document.createElement("span"));
	text.text(name);

	button.append(icon, text);

	button.on("mouseover", () => {
		$("#tagList button.active").removeClass("active");
		button.addClass("active");
	});

	button.on("click", () => {
		events.emit("tagUser", id, name);
		tagList.hide();
	});

	$("#tagList .wrapper").append(button);
}

const tagList = new Vue({
	el: "#tagList",
	data: {
		hidden: true
	},
	methods: {
		show() {
			if (!this.hidden) return;

			this.hidden = false;

			this.$nextTick(() => {
				let users = $("#users .user");

				for (var i = 0; i < users.length; i++) {
					let user = $(users[i]);
					addTag(user.data("id"), user.text());
				}
			});
		},
		hide() {
			if (this.hidden) return;

			this.hidden = true;
		},
		selectPrev() {
			let active = $("#tagList button.active");
			if (!active.length) {
				let last = $("#tagList button").last();
				last.addClass("active");
			} else {
				let prev = active.prev();

				if (prev.length) {
					prev.addClass("active");
					active.removeClass("active");
				} else {
					let last = $("#tagList button").last();
					last.addClass("active");
					active.removeClass("active");
				}
			}
		},
		selectNext() {
			let active = $("#tagList button.active");
			if (!active.length) {
				let first = $("#tagList button").first();
				first.addClass("active");
			} else {
				let next = active.next();

				if (next.length) {
					next.addClass("active");
					active.removeClass("active");
				} else {
					let first = $("#tagList button").first();
					first.addClass("active");
					active.removeClass("active");
				}
			}
		},
		search(searchStr) {
			//Check for users to put in the tag list
			let users = $("#users .user");
			for (var i = 0; i < users.length; i++) {
				let user = $(users[i]);
				let userId = user.data("id");
				let username = user.text();

				//Check if user matches search str
				if (username.toLowerCase().includes(searchStr.toLowerCase())) {

					//Check if it already exists to tag list before adding
					let exists = false;
					let tags = $("#tagList button");
					for (var j = 0; j < tags.length; j++) {
						let tag = $(tags[j]);

						if (tag.data("id") === userId) {
							exists = true;
							break;
						}
					}

					//If it doesn't exist, add
					if (!exists) {
						addTag(userId, username);
					}
				}
			}

			//Check for taglists that doesn't match the search str
			let tags = $("#tagList button");
			for (var i = 0; i < tags.length; i++) {
				let tag = $(tags[i]);
				let username = tag.text();

				//If username doesn't match search str, remove it
				if (!username.toLowerCase().includes(searchStr.toLowerCase())) {
					tag.remove();
				}
			}

			//Wrapping up...
			tags = $("#tagList button").get();

			if (!tags.length) {
				//If nothing matches the search str, hide the tag list
				$("#tagList").addClass("hidden");
			} else {
				//If there is, show and sort
				$("#tagList").removeClass("hidden");

				tags.sort(function(el1, el2) {
					return $(el1).text().trim().localeCompare($(el2).text().trim())
				});

				$("#tagList .wrapper").append(tags);
			}
		}
	}
});

module.exports = tagList;