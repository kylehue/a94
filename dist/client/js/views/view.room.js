"use strict";

//Modules
var events = require("../../../lib/events.js");

var client = require("./../client.js"); //Functions


function createCode() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var code = "";

  for (var i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
} //Create app


var roomApp = new Vue({
  el: "#roomApp",
  data: {
    hidden: true
  },
  methods: {
    show: function show() {
      var _this = this;

      this.hidden = false;
      this.$nextTick(function () {
        $("#roomCode").focus();
        $("#roomCode").on("keydown", function (event) {
          if (event.keyCode == 13) {
            _this.join();
          }
        });
      });
      $("#overlay").removeClass("hidden");
    },
    hide: function hide() {
      this.hidden = true;
      $("#overlay").addClass("hidden");
    },
    join: function join() {
      var code = $("#roomCode").val();
      events.emit("userJoin", code);
      this.hide();
    }
  }
});
module.exports = roomApp;