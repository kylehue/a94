//Modules
const utils = require("./../../../lib/utils.js");
const vector = require("./../../../lib/vector.js");

//Load canvas
const canvas = document.getElementById("zzz");
canvas.width = $(canvas).parent().outerWidth();
canvas.height = $(canvas).parent().outerHeight();
const ctx = canvas.getContext("2d");

addEventListener("resize", () => {
	canvas.width = $(canvas).parent().outerWidth();
	canvas.height = $(canvas).parent().outerHeight();
});

//Load "Z" images
let small_1 = new Image();
small_1.src = "assets/svg/z/small-1.svg";
let small_2 = new Image();
small_2.src = "assets/svg/z/small-2.svg";
let small_3 = new Image();
small_3.src = "assets/svg/z/small-3.svg";

let medium_1 = new Image();
medium_1.src = "assets/svg/z/medium-1.svg";
let medium_2 = new Image();
medium_2.src = "assets/svg/z/medium-2.svg";
let medium_3 = new Image();
medium_3.src = "assets/svg/z/medium-3.svg";

let big_1 = new Image();
big_1.src = "assets/svg/z/big-1.svg";
let big_2 = new Image();
big_2.src = "assets/svg/z/big-2.svg";
let big_3 = new Image();
big_3.src = "assets/svg/z/big-3.svg";

const images = [small_1, small_2, small_3, medium_1, medium_2, medium_3, big_1, big_2, big_3];

//Some varibles
let frameCount = 0;

class Entity {
	constructor(options) {
		options = options || {};

		this.id = utils.uid();
		this.image = utils.random(images);
		this.size = utils.random(5, 20);

		let x = typeof options.x != "number" ? utils.random(0, canvas.width) : options.x;
		let y = typeof options.y != "number" ? utils.random(0, canvas.height) : options.y;
		this.position = vector(x, y);

		let velX = utils.random(-0.1, 0.1);
		let velY = utils.random(0.01, 1);
		this.velocity = vector(velX, velY);

		this.angle = utils.random(-Math.PI, Math.PI);
		this.angularVelocity = utils.random(-0.0015, 0.0015);

		this.opacity = utils.random(0.01, 0.2);
		this.fadeStrength = utils.random(0.0003, 0.001);

		this.wiggliness = utils.random(-80, 80);
		this.wiggleRange = utils.random(0.5, 1);

		if (this.wiggliness < 0) {
			this.wiggliness = utils.clamp(this.wiggliness, -Infinity, -40);
		} else {
			this.wiggliness = utils.clamp(this.wiggliness, 40, Infinity);
		}

		this.offscreen = false;
	}

	update() {
		this.position.sub(this.velocity);
		//this.angle += this.angularVelocity;
		this.angle = this.velocity.heading() + Math.PI / 2;

		this.velocity.x = Math.cos(frameCount / this.wiggliness) * this.wiggleRange;

		this.wiggliness *= 1.01;

		if (this.position.y + this.size < 0 || this.position.x + this.size < 0 || this.position.x - this.size > canvas.width) {
			this.offscreen = true;
		}

		if (this.opacity - this.fadeStrength > 0) {
			this.opacity -= this.fadeStrength;
		} else {
			this.opacity = 0;
			this.offscreen = true;
		}
	}

	render() {
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(this.angle);
		ctx.globalAlpha = this.opacity;
		ctx.beginPath();
		ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
		ctx.closePath();
		ctx.restore();
	}
}

class World {
	constructor() {
		this.entities = [];

		this.maxEntitiesOnScreen = 30;

		for (var i = 0; i < 10; i++) {
			this.addEntity();
		}

		this._lastTick = 50;
	}

	addEntity() {
		this.entities.push(new Entity({
			x: canvas.width / 2 + utils.random(-50, 50),
			y: canvas.height + utils.random(50, 200)
		}));
	}

	update() {
		for (var i = 0; i < this.entities.length; i++) {
			let entity = this.entities[i];
			entity.update();

			if (entity.offscreen) {
				this.entities.splice(i, 1);
				this.addEntity();
			}
		}

		if (this.entities.length < this.maxEntitiesOnScreen) {
			if (frameCount % this._lastTick == 0) {
				for (var i = 0; i < Math.round(utils.random(5, 10)); i++) {
					this.addEntity();
				}

				this._lastTick = Math.round(utils.random(50, 150));
			}
		}
	}

	render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (var i = 0; i < this.entities.length; i++) {
			let entity = this.entities[i];
			entity.render();
		}
	}
}

let world = new World();
let animationId;

function animate() {
	frameCount++;
	world.update();
	world.render();
	animationId = requestAnimationFrame(animate);
}

module.exports = {
	play() {
		if (!animationId) {
			animate();
		}
	},
	stop() {
		cancelAnimationFrame(animationId);
		animationId = undefined;
	}
}