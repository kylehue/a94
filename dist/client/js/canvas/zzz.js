"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//Modules
var utils = require("./../../../lib/utils.js");

var vector = require("./../../../lib/vector.js"); //Load canvas


var canvas = document.getElementById("zzz");
canvas.width = $(canvas).parent().outerWidth();
canvas.height = $(canvas).parent().outerHeight();
var ctx = canvas.getContext("2d");
addEventListener("resize", function () {
  canvas.width = $(canvas).parent().outerWidth();
  canvas.height = $(canvas).parent().outerHeight();
}); //Load "Z" images

var small_1 = new Image();
small_1.src = "assets/svg/z/small-1.svg";
var small_2 = new Image();
small_2.src = "assets/svg/z/small-2.svg";
var small_3 = new Image();
small_3.src = "assets/svg/z/small-3.svg";
var medium_1 = new Image();
medium_1.src = "assets/svg/z/medium-1.svg";
var medium_2 = new Image();
medium_2.src = "assets/svg/z/medium-2.svg";
var medium_3 = new Image();
medium_3.src = "assets/svg/z/medium-3.svg";
var big_1 = new Image();
big_1.src = "assets/svg/z/big-1.svg";
var big_2 = new Image();
big_2.src = "assets/svg/z/big-2.svg";
var big_3 = new Image();
big_3.src = "assets/svg/z/big-3.svg";
var images = [small_1, small_2, small_3, medium_1, medium_2, medium_3, big_1, big_2, big_3]; //Some varibles

var frameCount = 0;

var Entity = /*#__PURE__*/function () {
  function Entity(options) {
    _classCallCheck(this, Entity);

    options = options || {};
    this.id = utils.uid();
    this.image = utils.random(images);
    this.size = utils.random(5, 20);
    var x = typeof options.x != "number" ? utils.random(0, canvas.width) : options.x;
    var y = typeof options.y != "number" ? utils.random(0, canvas.height) : options.y;
    this.position = vector(x, y);
    var velX = utils.random(-0.1, 0.1);
    var velY = utils.random(0.01, 1);
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

  _createClass(Entity, [{
    key: "update",
    value: function update() {
      this.position.sub(this.velocity); //this.angle += this.angularVelocity;

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
  }, {
    key: "render",
    value: function render() {
      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.closePath();
      ctx.restore();
    }
  }]);

  return Entity;
}();

var World = /*#__PURE__*/function () {
  function World() {
    _classCallCheck(this, World);

    this.entities = [];
    this.maxEntitiesOnScreen = 30;

    for (var i = 0; i < 10; i++) {
      this.addEntity();
    }

    this._lastTick = 50;
  }

  _createClass(World, [{
    key: "addEntity",
    value: function addEntity() {
      this.entities.push(new Entity({
        x: canvas.width / 2 + utils.random(-50, 50),
        y: canvas.height + utils.random(50, 200)
      }));
    }
  }, {
    key: "update",
    value: function update() {
      for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
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
  }, {
    key: "render",
    value: function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        entity.render();
      }
    }
  }]);

  return World;
}();

var world = new World();
var animationId;

function animate() {
  frameCount++;
  world.update();
  world.render();
  animationId = requestAnimationFrame(animate);
}

module.exports = {
  play: function play() {
    if (!animationId) {
      animate();
    }
  },
  stop: function stop() {
    cancelAnimationFrame(animationId);
    animationId = undefined;
  }
};