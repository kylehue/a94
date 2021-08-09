class Mouse {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.pressed = false;
		this.dragged = false;
		this.scrolled = false;
		this.scrollTop = false;
	}

	on(name, f) {
		if (typeof f != "function") return;
		addEventListener(name, f);
	}
}

const mouse = new Mouse();

mouse.on("mousedown", function() {
	mouse.pressed = true;
});

mouse.on("mouseup", function() {
	mouse.pressed = false;
	mouse.dragged = false;
});

mouse.on("mousemove", function(event) {
	mouse.x = event.clientX;
	mouse.y = event.clientY;

	mouse.speedX = event.movementX;
	mouse.speedY = event.movementY;

	if (mouse.pressed) {
		mouse.dragged = true;
	} else {
		mouse.dragged = false;
	}
});

mouse.on("mousewheel", function() {
	mouse.scrolled = true;

	if (event.wheelDelta > 0) {
		mouse.scrollTop = true;
	} else {
		mouse.scrollTop = false;
	}

	setTimeout(function() {
		mouse.scrolled = false;
	}, 100);
});

module.exports = mouse;