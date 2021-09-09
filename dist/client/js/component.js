"use strict";

//Open select
$(".select").on("mousedown", function (event) {
  var select = $(event.target);
  var itemWrapper = select.find(".select-itemWrapper");
  itemWrapper.toggleClass("hidden");
});

function _addSelectItemEvent(event) {
  var button = $(event.target);
  var parent = button.closest(".select");
  var itemWrapper = parent.find(".select-itemWrapper");
  parent[0].value = event.target.value;
  parent.data("code", $(event.target).data("code"));
  parent.find("label.select-value").text(button.text());
  parent.trigger("change");
  itemWrapper.addClass("hidden");
} //Select item


$(".select").find(".select-itemWrapper .select-item").on("mousedown", _addSelectItemEvent);

function _removeSpecialChars(str) {
  str = str.trim();
  str = str.replace(" ", "");
  str = str.replace(/[^\w\s]/gi, "");
  str = str.toLowerCase();
  return str;
} //Select filter


$(".select").find("input.select-filter").on("input", function (event) {
  var input = $(event.target);
  var itemWrapper = input.closest(".select-itemWrapper");
  var items = itemWrapper.find(".select-item");
  var value = event.target.value;
  value = _removeSpecialChars(value);

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    var itemValue = _removeSpecialChars(item.innerText);

    if (!itemValue.includes(value)) {
      $(item).addClass("hidden");
    } else {
      $(item).removeClass("hidden");
    }
  }
});

function _isDescendant(node, parentSelector) {
  var parent = node.offsetParent;

  if (parent) {
    while (!parent.matches(parentSelector)) {
      if (parent.offsetParent) {
        parent = parent.offsetParent;
      } else {
        return false;
      }
    }

    return true;
  }

  return false;
} //Hide select


addEventListener("mousedown", function (event) {
  var target = $(event.target);

  if (!_isDescendant(event.target, ".select") && !target.hasClass("select")) {
    $(".select-itemWrapper").addClass("hidden");
  }
}); //Textarea

$("#composeMessage").on("input", function (event) {
  var textArea = $(event.target);
  var parent = textArea.closest(".textArea");
  var placeholder = parent.find("label.placeholder");
  var value = textArea.val();

  if (value.length) {
    placeholder.addClass("hidden");
  } else {
    placeholder.removeClass("hidden");
  }
}); //Textarea autosize

var textAreas = $("textarea.auto-height");
autosize(textAreas); //Custom file button

$(".custom-file > button").on("click", function (event) {
  var button = $(event.target);
  var parent = button.closest(".custom-file");
  var input = parent.find("input[type='file']");
  input.trigger("click");
});
$("#tags .tag").on("click", function (event) {
  $(event.target).remove();
  $("#tags").trigger("change");
});