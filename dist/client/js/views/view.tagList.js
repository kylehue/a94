"use strict";

//Modules
var events = require("../../../lib/events.js");

function addTag(id, name) {
  var button = $(document.createElement("button"));
  button.addClass("default flex row v-center");
  button.data("id", id);
  var icon = $(document.createElement("img"));
  icon.attr("src", "assets/svg/user.svg");
  var text = $(document.createElement("span"));
  text.text(name);
  button.append(icon, text);
  button.on("mouseover", function () {
    $("#tagList button.active").removeClass("active");
    button.addClass("active");
  });
  button.on("click", function () {
    events.emit("tagUser", id, name);
    tagList.hide();
  });
  $("#tagList .wrapper").append(button);
}

var tagList = new Vue({
  el: "#tagList",
  data: {
    hidden: true
  },
  methods: {
    show: function show() {
      var _this = this;

      if (!this.hidden) return;
      this.hidden = false;
      this.$nextTick(function () {
        _this.search("");
      });
    },
    hide: function hide() {
      if (this.hidden) return;
      this.hidden = true;
    },
    selectPrev: function selectPrev() {
      var active = $("#tagList button.active");

      if (!active.length) {
        var last = $("#tagList button").last();
        last.addClass("active");
      } else {
        var prev = active.prev();

        if (prev.length) {
          prev.addClass("active");
          active.removeClass("active");
        } else {
          var _last = $("#tagList button").last();

          _last.addClass("active");

          active.removeClass("active");
        }
      }
    },
    selectNext: function selectNext() {
      var active = $("#tagList button.active");

      if (!active.length) {
        var first = $("#tagList button").first();
        first.addClass("active");
      } else {
        var next = active.next();

        if (next.length) {
          next.addClass("active");
          active.removeClass("active");
        } else {
          var _first = $("#tagList button").first();

          _first.addClass("active");

          active.removeClass("active");
        }
      }
    },
    search: function search(searchStr) {
      //Check for users to put in the tag list
      var users = $("#users .user");

      for (var i = 0; i < users.length; i++) {
        var user = $(users[i]);
        var userId = user.data("id");
        var username = user.text(); //Skip if the user is already tagged

        var mentions = [];
        var mentionedUsers = $("#tags .tag");

        for (var j = 0; j < mentionedUsers.length; j++) {
          var _user = $(mentionedUsers[j]);

          var id = _user.data("id");

          mentions.push(id);
        }

        if (mentions.includes(userId)) continue; //Check if user matches search str

        if (username.toLowerCase().includes(searchStr.toLowerCase())) {
          //Check if it already exists to tag list before adding
          var exists = false;

          var _tags = $("#tagList button");

          for (var j = 0; j < _tags.length; j++) {
            var tag = $(_tags[j]);

            if (tag.data("id") === userId) {
              exists = true;
              break;
            }
          } //If it doesn't exist, add


          if (!exists) {
            addTag(userId, username);
          }
        }
      } //Check for taglists that doesn't match the search str


      var tags = $("#tagList button");

      for (var i = 0; i < tags.length; i++) {
        var _tag = $(tags[i]);

        var _username = _tag.text(); //If username doesn't match search str, remove it


        if (!_username.toLowerCase().includes(searchStr.toLowerCase())) {
          _tag.remove();
        }
      } //Wrapping up...


      tags = $("#tagList button").get();

      if (!tags.length) {
        //If nothing matches the search str, hide the tag list
        $("#tagList").addClass("hidden");
      } else {
        //If there is, show and sort
        $("#tagList").removeClass("hidden");
        tags.sort(function (el1, el2) {
          return $(el1).text().trim().localeCompare($(el2).text().trim());
        });
        $("#tagList .wrapper").append(tags);
      }
    }
  }
});
module.exports = tagList;