"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var utils = require("./../lib/utils.js");

var config = require("./../lib/config.js");

var RoomFile = /*#__PURE__*/function () {
  function RoomFile(metadata) {
    _classCallCheck(this, RoomFile);

    this.id = utils.uid();
    this.buffer = [];
    this.metadata = metadata || {};
    this.size = 0;
  }

  _createClass(RoomFile, [{
    key: "addChunk",
    value: function addChunk(chunk) {
      for (var i = 0; i < chunk.length; i++) {
        this.buffer.push(chunk[i]);
      }

      this.size += chunk.length;
    }
  }]);

  return RoomFile;
}();

var Room = /*#__PURE__*/function () {
  function Room(code) {
    _classCallCheck(this, Room);

    this.code = code;
    this.messages = [];
    this.users = [];
    this.confirmedUsers = [];
    this.typingUsers = [];
    this.options = {
      name: code,
      locked: false
    };
  }

  _createClass(Room, [{
    key: "removeUser",
    value: function removeUser(userId) {
      var user = this.users.find(function (u) {
        return u.id === userId;
      });

      if (user) {
        this.users.splice(this.users.indexOf(user), 1);
      }

      var confirmedUser = this.confirmedUsers.find(function (u) {
        return u === userId;
      });

      if (confirmedUser) {
        this.confirmedUsers.splice(this.confirmedUsers.indexOf(confirmedUser), 1);
      }

      this.removeTypingUser(userId);
    }
  }, {
    key: "addTypingUserId",
    value: function addTypingUserId(userId) {
      if (!this.typingUsers.includes(userId)) {
        this.typingUsers.push(userId);
      }
    }
  }, {
    key: "removeTypingUser",
    value: function removeTypingUser(userId) {
      var typingUser = this.typingUsers.find(function (u) {
        return u === userId;
      });

      if (typingUser) {
        this.typingUsers.splice(this.typingUsers.indexOf(typingUser), 1);
      }
    }
  }, {
    key: "confirmUserId",
    value: function confirmUserId(userId) {
      if (!this.confirmedUsers.includes(userId)) {
        this.confirmedUsers.push(userId);
      }
    }
  }, {
    key: "addUser",
    value: function addUser(user) {
      this.users.push(user);
    }
  }, {
    key: "getUser",
    value: function getUser(userId) {
      var user = this.users.find(function (u) {
        return u.id === userId;
      });

      if (user) {
        return user;
      }
    }
  }, {
    key: "addMessage",
    value: function addMessage(data) {
      this.messages.push(data);

      if (this.messages.length > config.maxMessages) {
        this.messages.shift();
      }
    }
  }, {
    key: "createFile",
    value: function createFile(metadata) {
      var file = new RoomFile(metadata);
      return file;
    }
  }]);

  return Room;
}();

module.exports = Room;