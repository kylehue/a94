"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var io = require("socket.io-client");

var utils = require("./../../lib/utils.js");

function UI_addUpload(fileId, fileName, progress) {
  var uploadWrapper = $(document.createElement("div"));
  uploadWrapper.addClass("upload flex row v-center");
  uploadWrapper.data("fileId", fileId);
  var uploadIcon = $(document.createElement("img"));
  uploadIcon.attr("src", "assets/svg/file.svg");
  var uploadInfoWrapper = $(document.createElement("div"));
  uploadInfoWrapper.addClass("upload-info flex col");
  var uploadName = $(document.createElement("label"));
  uploadName.addClass("note upload-name");
  uploadName.text(fileName);
  var uploadProgressWrapper = $(document.createElement("div"));
  uploadProgressWrapper.addClass("upload-progress-wrapper");
  var uploadProgress = $(document.createElement("div"));
  uploadProgress.addClass("upload-progress");
  uploadProgress.width(progress + "%");
  var uploadCancel = $(document.createElement("button"));
  uploadCancel.addClass("upload-cancel default flex center");
  uploadCancel.on("click", function () {
    uploadWrapper.data("destroy", true);
  });
  var uploadCancelIcon = $(document.createElement("img"));
  uploadCancelIcon.attr("src", "assets/svg/cross-alt.svg");
  uploadCancel.append(uploadCancelIcon);
  uploadProgressWrapper.append(uploadProgress);
  uploadInfoWrapper.append(uploadName, uploadProgressWrapper);
  uploadWrapper.append(uploadIcon, uploadInfoWrapper, uploadCancel);
  $("#uploadsWrapper").append(uploadWrapper);
  $("#uploadsWrapper").trigger("change");
  return uploadWrapper;
}

var Client = /*#__PURE__*/function () {
  function Client() {
    var _this = this;

    _classCallCheck(this, Client);

    this.socket = io();
    this.roomCode = undefined;
    this.username = undefined;
    this.room = null;
    this.socket.on("autoCode", function (code) {
      _this.roomCode = code;
    });
    this.socket.on("updateRoom", function (room) {
      _this.room = room;
    });
    this.socket.on("roomCodeChange", function (oldCode, newCode) {
      if (oldCode === _this.roomCode) {
        _this.roomCode = newCode;
        _this.room.code = newCode;

        _this.socket.emit("joinNewCode", newCode, oldCode);
      }
    });
    this.socket.on("confirmedUser", function (roomCode) {
      if (_this.roomCode === roomCode) {
        _this.socket.emit("joinNewCode", roomCode, "");

        _this.socket.emit("reloadRoom", roomCode);
      }
    });
    this.socket.on("removeValidateButtons", function () {
      $("#users .user button.validate").remove();
    });
    this.socket.on("clientKicked", function (roomCode) {
      _this.socket.emit("leaveRoom", roomCode);

      var rooms = $("#rooms .room");

      for (var i = 0; i < rooms.length; i++) {
        var room = $(rooms[i]);

        if (room.data("code") === roomCode) {
          room.remove();
          break;
        }
      }

      if (!rooms.length) {
        $("#rooms label.select-value").text("Rooms");
      }

      _this.roomCode = undefined;
      _this.room = null;
    });
  }

  _createClass(Client, [{
    key: "typing",
    value: function typing() {
      this.socket.emit("userTyping", this.roomCode);
    }
  }, {
    key: "afk",
    value: function afk() {
      this.socket.emit("userAFK", this.roomCode);
    }
  }, {
    key: "confirmUser",
    value: function confirmUser(userId) {
      this.socket.emit("confirmUser", this.roomCode, userId);
    }
  }, {
    key: "declineUser",
    value: function declineUser(userId) {
      this.socket.emit("declineUser", this.roomCode, userId);
    }
  }, {
    key: "setUsername",
    value: function setUsername(username) {
      this.username = username;
      this.socket.emit("changeUsername", this.username);
    }
  }, {
    key: "join",
    value: function join(code) {
      this.socket.emit("userJoin", code, {
        name: this.username
      });
      this.roomCode = code;
    }
  }, {
    key: "sendMessage",
    value: function sendMessage(message) {
      if (this.roomCode) {
        //Get mentions
        var mentions = [];
        var mentionedUsers = $("#tags .tag");

        for (var i = 0; i < mentionedUsers.length; i++) {
          var user = $(mentionedUsers[i]);
          var id = user.data("id");
          mentions.push(id);
        } //Clear mentions


        mentionedUsers.trigger("click");
        var msgData = {
          type: "client",
          userId: this.socket.id,
          username: this.username,
          timestamp: Date.now(),
          message: message,
          mentions: mentions
        };
        this.socket.emit("sendMessage", this.roomCode, msgData);
      }
    }
  }, {
    key: "sendFile",
    value: function sendFile(file) {
      var _this2 = this;

      var chunkSize = 10024;
      var uploadId = utils.uid();

      if (this.roomCode) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = function () {
          var buffer = new Uint8Array(reader.result);
          var metadata = {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
          };
          var msgData = {
            userId: _this2.socket.id,
            username: _this2.username,
            timestamp: Date.now()
          };
          console.log(metadata);
          var uploadUI = UI_addUpload(uploadId, metadata.name, 0);

          _this2.socket.emit("uploadStart", uploadId, _this2.roomCode, msgData, metadata);

          _this2.socket.on("uploadNext" + uploadId, function (currentSize) {
            var chunk = buffer.slice(currentSize, currentSize + chunkSize);

            _this2.socket.emit("uploadProgress" + uploadId, chunk);

            var progress = currentSize / metadata.size * 100 + "%";
            var uploads = $("#uploadsWrapper .upload");

            for (var i = 0; i < uploads.length; i++) {
              var upl = $(uploads[i]);

              if (upl.data("fileId") == uploadId) {
                upl.find(".upload-progress").width(progress);
              }

              if (upl.data("destroy")) {
                _this2.socket.emit("uploadDestroy" + uploadId);
              }
            }
          });

          _this2.socket.on("uploadFinish" + uploadId, function () {
            uploadUI.remove();
            $("#uploadsWrapper").trigger("change");
          });
        };
      }
    }
  }]);

  return Client;
}();

var client = new Client();
module.exports = client;