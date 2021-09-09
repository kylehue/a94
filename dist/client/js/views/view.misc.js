"use strict";

var splashScreen = new Vue({
  el: "#splashScreen",
  data: {
    hidden: true
  },
  methods: {
    show: function show() {
      this.hidden = false;
    },
    hide: function hide() {
      this.hidden = true;
    }
  }
});