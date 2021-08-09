const utils = require("./utils.js");
var _once = false;

class Events {
	constructor() {
		this.emits = {};
		this.listeners = [];
		this.maxListeners = 100;
	}

	setMaxListeners(n) {
		this.maxListeners = n;
	}

	removeListener(find, value) {
		let listener = this.listeners.find(l => l[find] === value);

		if (!value) {
			listener = find;
		}

		if (listener) {
			for(var i = 0; i < this.listeners.length; i++){
				if (this.listeners[i].id === listener.id) {
					this.listeners.splice(i, 1);
					break;
				}
			}
		}
	}

	emit(name) {
		if (!name) return;

		let args = [];
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		args.shift();

		this.emits[name] = args;

		let listeners = [];

		for (var i = 0; i < this.listeners.length; i++) {
			let listener = this.listeners[i];
			if (listener.name === name) {
				listeners.push(listener);
			}
		}

		for (var i = 0; i < listeners.length; i++) {
			let listener = listeners[i];
			if (typeof listener.method == "function") {
				listener.method(...args);

				if (listener.once) {
					this.removeListener("id", listener.id);
				}
			}
		}
	}

	on(name, f) {
		if (!name || !f || typeof f != "function") return;

		let listener = {
			id: utils.uid(),
			name: name,
			method: f,
			once: _once
		};

		this.listeners.push(listener);

		if (this.listeners.length >= this.maxListeners) {
			this.listeners.shift();
			console.warn("Reached the max number of listeners.")
		}

		return listener;
	}

	once(name, f) {
		_once = true;
		let listener = this.on(name, f);
		_once = false;

		return listener;
	}
}

const events = new Events();

module.exports = events;