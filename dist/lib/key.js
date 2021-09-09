"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Key = /*#__PURE__*/function () {
  function Key() {
    _classCallCheck(this, Key);

    this.code = null;
    this.name = null;
    this.activeKeys = {};
  }

  _createClass(Key, [{
    key: "check",
    value: function check(code) {
      if (typeof code == "number") return code in this.activeKeys;
      var values = Object.values(this.activeKeys);
      return values.includes(code);
    }
  }, {
    key: "on",
    value: function on(name, f) {
      if (typeof f != "function") return;
      addEventListener(name, f);
    }
  }]);

  return Key;
}();

var key = new Key();
key.on("keydown", function (event) {
  key.code = event.keyCode;
  key.name = event.code;
  key.activeKeys[key.code] = key.name;
});
key.on("keyup", function (event) {
  key.code = event.keyCode;
  key.name = event.code;
  delete key.activeKeys[key.code];
});
module.exports = key;