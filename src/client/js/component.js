//Open select
$(".select").on("mousedown", event => {
	const select = $(event.target);
	const itemWrapper = select.find(".select-itemWrapper");
	itemWrapper.toggleClass("hidden");
});

//Select item
$(".select").find(".select-itemWrapper .select-item").on("mousedown", event => {
	const button = $(event.target);
	const parent = button.closest(".select");
	const itemWrapper = parent.find(".select-itemWrapper");
	parent[0].value = event.target.value;
	parent.find("label.select-value").text(button.text());
	parent.trigger("change");
	itemWrapper.addClass("hidden");
});

function removeSpecialChars(str) {
	str = str.trim();
	str = str.replace(" ", "");
	str = str.replace(/[^\w\s]/gi, "");
	str = str.toLowerCase();

	return str;
}

//Select filter
$(".select").find("input.select-filter").on("input", event => {
	const input = $(event.target);
	const itemWrapper = input.closest(".select-itemWrapper");
	const items = itemWrapper.find(".select-item");
	let value = event.target.value;
	value = removeSpecialChars(value);
	for (var i = 0; i < items.length; i++) {
		let item = items[i];
		let itemValue = removeSpecialChars(item.innerText);
		if (!itemValue.includes(value)) {
			$(item).addClass("hidden");
		} else {
			$(item).removeClass("hidden");
		}
	}
});

function isDescendant(node, parentSelector) {
	let parent = node.offsetParent;
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
}

//Hide select
addEventListener("mousedown", event => {
	const target = $(event.target);
	if (!isDescendant(event.target, ".select") && !target.hasClass("select")) {
		$(".select-itemWrapper").addClass("hidden");
	}
});

//Textarea
$("textarea").on("input", event => {
	const textArea = $(event.target);
	const parent = textArea.closest(".textArea");
	const placeholder = parent.find("label.placeholder");
	let value = textArea.val();
	if (value.length) {
		placeholder.addClass("hidden");
	} else {
		placeholder.removeClass("hidden");
	}
});

//Textarea autosize
const textAreas = $("textarea.auto-height");
autosize(textAreas);

//Custom file button
$(".custom-file > button").on("click", event => {
	const button = $(event.target);
	const parent = button.closest(".custom-file");
	const input = parent.find("input[type='file']");
	input.trigger("click");
});