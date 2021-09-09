const splashScreen = new Vue({
	el: "#splashScreen",
	data: {
		hidden: true
	},
	methods: {
		show() {
			this.hidden = false;
		},
		hide() {
			this.hidden = true;
		}
	}
});