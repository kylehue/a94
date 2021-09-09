"use strict";

//Modules
var events = require("../../../lib/events.js");

var utils = require("../../../lib/utils.js");

var config = require("../../../lib/config.js");

var client = require("./../client.js");

var imageTypes = ["image/png", "image/jpeg", "image/gif"];
var _filesCache = [];

function addFile(type, id, previewSrc, filename) {
  var wrapper = $(document.createElement("div"));
  wrapper.addClass("filePreview");
  wrapper.data("id", id);
  wrapper.attr("title", filename);
  wrapper.on("click", function (event) {
    var file = _filesCache.find(function (f) {
      return f.id === wrapper.data("id");
    });

    if (file) {
      _filesCache.splice(_filesCache.indexOf(file), 1);

      wrapper.remove();

      if (!_filesCache.length) {
        fileUploadApp.hide();
      }
    }
  });
  var imagePreview = $(document.createElement("img"));

  if (type == "blob") {
    imagePreview.addClass("blobPreview");
    imagePreview.attr("src", "assets/svg/file.svg");
  } else {
    imagePreview.addClass("imagePreview");
    imagePreview.attr("src", previewSrc);
  }

  var previewName = $(document.createElement("p"));
  previewName.addClass("fileName");
  previewName.text(filename);
  var removeButton = $(document.createElement("button"));
  removeButton.addClass("default fileRemove");
  var removeButtonImage = $(document.createElement("img"));
  removeButtonImage.attr("src", "assets/svg/cross-alt.svg");
  removeButton.append(removeButtonImage);
  wrapper.append(imagePreview, previewName, removeButton);
  $("#filePreviews").append(wrapper);
} //Create app


var fileUploadApp = new Vue({
  el: "#fileUploadApp",
  data: {
    hidden: true,
    fileName: "file",
    roomName: "room",
    showError: true,
    errorText: ""
  },
  methods: {
    show: function show() {
      this.hidden = false;
      this.$nextTick(function () {
        //Enable horizontal scrolling
        var filePreviews = document.querySelector("#filePreviews");
        filePreviews.addEventListener("mousewheel", function (event) {
          event.preventDefault();
          filePreviews.scrollLeft += event.deltaY;
        });
      });
      $("#overlay").removeClass("hidden");
    },
    hide: function hide() {
      this.hidden = true;
      $("#overlay").addClass("hidden");
    },
    ask: function ask(files, roomName) {
      if (!files.length) return; //Update files cache

      _filesCache = [];

      for (var i = 0; i < files.length; i++) {
        var file = files[i];

        if (file.size < config.maxFileSize) {
          _filesCache.push(files[i]);
        } else {
          this.showError = true;
          this.errorText = "Max file size is " + utils.bytesToSize(config.maxFileSize);
        }
      } //Create file name for dialog's title


      var fileName = "";

      var _fCount = Math.min(files.length, 5);

      for (var i = 0; i < _fCount; i++) {
        fileName += files[i].name;

        if (i < _fCount - 1) {
          fileName += ", ";
        }
      }

      this.fileName = fileName;
      this.roomName = roomName;
      this.show();
      this.$nextTick(function () {
        //Clear all file previews
        $("#filePreviews .filePreview").remove(); //Create DOM file previews

        for (var i = 0; i < _filesCache.length; i++) {
          var _file = _filesCache[i];
          _file.id = utils.uid();
          var url = URL.createObjectURL(_file);
          var type = _file.type;

          if (!imageTypes.includes(type)) {
            type = "blob";
          }

          addFile(type, _file.id, url, _file.name);
        }
      });
    },
    upload: function upload() {
      for (var i = 0; i < _filesCache.length; i++) {
        var file = _filesCache[i];
        client.sendFile(file);
      }

      this.hide();
    }
  }
});
module.exports = fileUploadApp;