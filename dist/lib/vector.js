"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function random(min, max) {
  return Math.random() * (max - min) + min;
}

var Vector = /*#__PURE__*/function () {
  function Vector() {
    _classCallCheck(this, Vector);

    var x = _typeof(arguments[0]) == "object" ? arguments[0].x : arguments[0];
    var y = _typeof(arguments[0]) == "object" ? arguments[0].y : arguments[1];
    this.x = x || 0;
    this.y = y || 0;
  }

  _createClass(Vector, [{
    key: "add",
    value: function add() {
      var x = _typeof(arguments[0]) == "object" ? arguments[0].x : arguments[0];
      var y = _typeof(arguments[0]) == "object" ? arguments[0].y : arguments[1];
      this.x += x || 0;
      this.y += y || 0;
      return this;
    }
  }, {
    key: "sub",
    value: function sub() {
      var x = _typeof(arguments[0]) == "object" ? arguments[0].x : arguments[0];
      var y = _typeof(arguments[0]) == "object" ? arguments[0].y : arguments[1];
      this.x -= x || 0;
      this.y -= y || 0;
      return this;
    }
  }, {
    key: "mult",
    value: function mult(n) {
      this.x *= n;
      this.y *= n;
      return this;
    }
  }, {
    key: "div",
    value: function div(n) {
      this.x /= n;
      this.y /= n;
      return this;
    }
  }, {
    key: "set",
    value: function set() {
      var x = _typeof(arguments[0]) == "object" ? arguments[0].x : arguments[0];
      var y = _typeof(arguments[0]) == "object" ? arguments[0].y : arguments[1];
      this.x = x || 0;
      this.y = y || 0;
      return this;
    }
  }, {
    key: "equals",
    value: function equals() {
      var x = _typeof(arguments[0]) == "object" ? arguments[0].x : arguments[0];
      var y = _typeof(arguments[0]) == "object" ? arguments[0].y : arguments[1];
      return this.x == x && this.y == y;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.x = 0;
      this.y = 0;
      return this;
    }
  }, {
    key: "limit",
    value: function limit(n) {
      n = n || 1;
      if (this.getMag() >= n) this.setMag(n);
      return this;
    }
  }, {
    key: "lerp",
    value: function lerp(v, weight) {
      weight = weight || 0.1;
      if (typeof v.x == "number") this.x = weight * (v.x - this.x) + this.x;
      if (typeof v.y == "number") this.y = weight * (v.y - this.y) + this.y;
      return this;
    }
  }, {
    key: "dist",
    value: function dist() {
      var x = _typeof(arguments[0]) == "object" ? arguments[0].x : arguments[0];
      var y = _typeof(arguments[0]) == "object" ? arguments[0].y : arguments[1];
      return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
    }
  }, {
    key: "heading",
    value: function heading() {
      var x = _typeof(arguments[0]) == "object" ? arguments[0].x : arguments[0];
      var y = _typeof(arguments[0]) == "object" ? arguments[0].y : arguments[1];
      if (!arguments.length) return Math.atan2(this.y, this.x);
      return Math.atan2(y - this.y, x - this.x);
    }
  }, {
    key: "norm",
    value: function norm() {
      var mag = this.getMag();
      if (mag != 0) this.mult(1 / mag, 1 / mag);
      return this;
    }
  }, {
    key: "copy",
    value: function copy() {
      return new Vector(this.x, this.y);
    }
  }, {
    key: "setMag",
    value: function setMag(n) {
      var mag = this.getMag();
      mag = mag == 0 ? 0.001 : mag;
      this.x *= 1 / mag * n;
      this.y *= 1 / mag * n;
      return this;
    }
  }, {
    key: "getMag",
    value: function getMag() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  }, {
    key: "random2D",
    value: function random2D(n) {
      n = typeof n != "number" ? 1 : n;
      this.x = random(-n, n);
      this.y = random(-n, n);
      this.setMag(n);
      return this;
    }
  }]);

  return Vector;
}();

module.exports = function (x, y) {
  return new Vector(x, y);
};