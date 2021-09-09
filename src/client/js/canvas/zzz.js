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
		this.size = utils.random(5, 40);

		let x = typeof options.x != "number" ? utils.random(0, canvas.width) : options.x;
		let y = typeof options.y != "number" ? utils.random(0, canvas.height) : options.y;
		this.position = vector(x, y);

		let velX = utils.random(-0.1, 0.1);
		let velY = utils.random(0.01, 1);
		this.velocity = vector(velX, velY);

		this.angle = utils.random(-Math.PI, Math.PI);
		this.angularVelocity = utils.random(-0.001, 0.001);

		this.opacity = utils.random(0.01, 0.05);

		this.offscreen = false;
	}

	update() {
		this.position.sub(this.velocity);
		this.angle += this.angularVelocity;

		if (this.position.y + this.size < 0 || this.position.x + this.size < 0 || this.position.x - this.size > canvas.width) {
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

		this.maxEntitiesOnScreen = 10;

		for (var i = 0; i < 10; i++) {
			this.entities.push(new Entity());
		}

		this._lastTick = Math.round(utils.random(200, 600));
	}

	update() {
		for (var i = 0; i < this.entities.length; i++) {
			let entity = this.entities[i];
			entity.update();

			if (entity.offscreen) {
				this.entities.splice(i, 1);
				this.entities.push(new Entity({
					y: canvas.height + 50
				}));
			}
		}

		if (this.entities.length < this.maxEntitiesOnScreen) {
			if (frameCount % this._lastTick == 0) {
				this.entities.push(new Entity({
					y: canvas.height + 50
				}));

				this._lastTick = Math.round(utils.random(200, 600));
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