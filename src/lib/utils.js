const _ids = [];
let _lengthAuto;

module.exports = {
	uid: function(length) {
		length = length || 16;
		let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let id = "";

		function generateId() {
			id = "";
			let len = _lengthAuto || length;
			for (var i = 0; i < len; i++) {
				id += chars[Math.floor(Math.random() * chars.length)];
			}
		}

		generateId();

		let start = Date.now();
		while (_ids.includes(id)) {
			if (Date.now() - start > 20) {
				_lengthAuto = !_lengthAuto ? length + 1 : _lengthAuto + 1;
			}
			generateId();
		}

		_ids.push(id);
		return id;
	},
	lerp: function(start, stop, weight) {
		return weight * (stop - start) + start;
	},
	dist: function(x1, y1, x2, y2) {
		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	},
	map: function(n, start1, stop1, start2, stop2) {
		return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
	},
	random: function() {
		if (arguments.length == 2 && typeof arguments[0] == "number" && typeof arguments[1] == "number") {
			return Math.random() * (arguments[1] - arguments[0]) + arguments[0];
		} else if (arguments.length == 1 && typeof arguments[0] == "number") {
			return Math.random() * arguments[0];
		} else if (Array.isArray(arguments[0])) {
			return arguments[0][Math.floor(Math.random() * arguments[0].length)];
		} else if (arguments.length > 2) {
			let args = [...arguments];
			return args[Math.floor(Math.random() * args.length)];
		}
	},
	clamp: function(n, min, max) {
		let val = n < min ? min : n;
		val = val > max ? max : val;
		return val;
	},
	bytesToSize: function(bytes) {
		//https://stackoverflow.com/a/18650828/16446474
		let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
		if (bytes == 0) return "0 Byte";
		let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
	}
};