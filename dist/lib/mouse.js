"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Mouse = /*#__PURE__*/function () {
  function Mouse() {
    _classCallCheck(this, Mouse);

    this.x = 0;
    this.y = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.pressed = false;
    this.dragged = false;
    this.scrolled = false;
    this.scrollTop = false;
  }

  _createClass(Mouse, [{
    key: "on",
    value: function on(name, f) {
      if (typeof f != "function") return;
      addEventListener(name, f);
    }
  }]);

  return Mouse;
}();

var mouse = new Mouse();
mouse.on("mousedown", function () {
  mouse.pressed = true;
});
mouse.on("mouseup", function () {
  mouse.pressed = false;
  mouse.dragged = false;
});
mouse.on("mousemove", function (event) {
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
mouse.on("mousewheel", function () {
  mouse.scrolled = true;

  if (event.wheelDelta > 0) {
    mouse.scrollTop = true;
  } else {
    mouse.scrollTop = false;
  }

  setTimeout(function () {
    mouse.scrolled = false;
  }, 100);
});
module.exports = mouse;