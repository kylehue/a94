"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var utils = require("./utils.js");

var _once = false;

var Events = /*#__PURE__*/function () {
  function Events() {
    _classCallCheck(this, Events);

    this.emits = {};
    this.listeners = [];
    this.maxListeners = 100;
  }

  _createClass(Events, [{
    key: "setMaxListeners",
    value: function setMaxListeners(n) {
      this.maxListeners = n;
    }
  }, {
    key: "removeListener",
    value: function removeListener(find, value) {
      var listener = this.listeners.find(function (l) {
        return l[find] === value;
      });

      if (!value) {
        listener = find;
      }

      if (listener) {
        for (var i = 0; i < this.listeners.length; i++) {
          if (this.listeners[i].id === listener.id) {
            this.listeners.splice(i, 1);
            break;
          }
        }
      }
    }
  }, {
    key: "emit",
    value: function emit(name) {
      if (!name) return;
      var args = [];

      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }

      args.shift();
      this.emits[name] = args;
      var listeners = [];

      for (var i = 0; i < this.listeners.length; i++) {
        var listener = this.listeners[i];

        if (listener.name === name) {
          listeners.push(listener);
        }
      }

      for (var i = 0; i < listeners.length; i++) {
        var _listener = listeners[i];

        if (typeof _listener.method == "function") {
          _listener.method.apply(_listener, args);

          if (_listener.once) {
            this.removeListener("id", _listener.id);
          }
        }
      }
    }
  }, {
    key: "on",
    value: function on(name, f) {
      if (!name || !f || typeof f != "function") return;
      var listener = {
        id: utils.uid(),
        name: name,
        method: f,
        once: _once
      };
      this.listeners.push(listener);

      if (this.listeners.length >= this.maxListeners) {
        this.listeners.shift();
        console.warn("Reached the max number of listeners.");
      }

      return listener;
    }
  }, {
    key: "once",
    value: function once(name, f) {
      _once = true;
      var listener = this.on(name, f);
      _once = false;
      return listener;
    }
  }]);

  return Events;
}();

var events = new Events();
module.exports = events;