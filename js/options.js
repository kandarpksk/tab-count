// save options to localstorage
function save_options(type, value) {
  console.log('type: ' + type + ', value: ' + value);
  if (type == "popupCount") {
    localStorage["popupDisplayOption"] = value;
  } else if (type == 'tabDedupe') {
    localStorage["tabDedupe"] = value;
  } else if (type == 'tabJanitor') {
    localStorage["tabJanitor"] = value;
  } else if (type == 'tabJanitorDays') {
    localStorage["tabJanitorDays"] = value;
  } else {
    localStorage["badgeDisplayOption"] = value;
    chrome.runtime.reload();
  }
  // update selection status
  var status = document.getElementById("status");
  status.innerHTML = "Selection saved!";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// restore selection from localstorage
function restore_options() {
  // restore options for popupDisplay
  var selection = localStorage["popupDisplayOption"];
  var radios = document.popupOptionsForm.tabCountRadios;
  if (!selection) {
    document.getElementById("defaultPopupSelection").checked = true;
  }
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].value == selection) {
      radios[i].checked = true;
    }
  }

  // restore options for tabDedupe
  document.getElementById("tabDedupe").checked = Boolean(localStorage["tabDedupe"]);

  // restore tab janitor options
  document.getElementById("tabJanitor").checked = Boolean(localStorage["tabJanitor"]);
  document.getElementById("tabJanitorDays").value = localStorage["tabJanitorDays"] || 5;

  // restore options for badgeDisplay
  /*var selection = localStorage["badgeDisplayOption"];
  var radios = document.badgeOptionsForm.badgeCountRadios;
  if (!selection) {
    document.getElementById("defaultBadgeSelection").checked = true;
  }
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].value == selection) {
      radios[i].checked = true;
    }
  }*/
}

document.addEventListener("DOMContentLoaded", restore_options);

// add eventlisteners to the radio buttons
var radios = document.popupOptionsForm.tabCountRadios;
for (var i = 0; i < radios.length; i++) {
  radios[i].addEventListener("click", (function(value) {
    return function() {
      save_options("popupCount", value);
    }
  })(radios[i].value));
}

// add event listener for tabDedupe checkbox
var checkbox = document.getElementById("tabDedupe");
checkbox.addEventListener("click", (function(value) {
    return function() {
      save_options("tabDedupe", value);
    }
  })(checkbox.checked));

// add event listener for tabJanitor checkbox
var janitorCheckbox = document.getElementById("tabJanitor");
janitorCheckbox.addEventListener("click", (function(value) {
    return function() {
      save_options("tabJanitor", value);
    }
  })(janitorCheckbox.checked));

// add event listener for tabJanitor checkbox
document.getElementById("tabJanitorDays").oninput = function() {
  save_options("tabJanitorDays", document.getElementById("tabJanitorDays").valueAsNumber);
};

/*var radios = document.badgeOptionsForm.badgeCountRadios;
for (var i = 0; i < radios.length; i++) {
  radios[i].addEventListener("click", (function(value) {
    return function() {
      save_options("badgeCount", value);
    }
  })(radios[i].value));
}*/

document.getElementById("refreshButton").addEventListener("click", function() {
  location.reload();
});

document.getElementById("windowsCount").innerHTML = localStorage["windowsCount"];
document.getElementById("tabsCount").innerHTML = localStorage["allWindowsTabsCount"];
