// set icon's tooltip
function updateBadgeTitle(count) {
  iconTitle = 'You have ' + count + ' open tab(s).';
  chrome.browserAction.setTitle({title: iconTitle});
}

// set icon's text
function updateBadgeText() {
  var displayOption = localStorage["badgeDisplayOption"];
  if(typeof displayOption == "undefined" || displayOption == "allWindows") {
    // chrome.browserAction.setBadgeText({text: String(allWindowsTabCount)});
    // updateBadgeTitle(allWindowsTabCount);
    // limiting count to current window
    chrome.tabs.query({currentWindow:true}, function(tabs) {
      chrome.browserAction.setBadgeText({text: String(tabs.length)});
      updateBadgeTitle(tabs.length);
    });
  } else {
    // use callback
    // this feature is currently disabled from options.html and options.js
    count = getCurrentWindowTabs(updateCurrentWindowBadge);
  }
}

// count all tabs in all windows
function getAllStats(callback) {
  chrome.windows.getAll({populate: true}, function (window_list) {
    callback(window_list);
  });
}

function displayResults(window_list) {
  allWindowsTabCount = 0;
  windowCount = 0;
  for(var i=0; i<window_list.length; i++) {
    allWindowsTabCount += window_list[i].tabs.length;
  }
  localStorage["windowsCount"] = window_list.length;
  localStorage["allWindowsTabsCount"] = allWindowsTabCount;
  updateBadgeText();
}

function registerTabDedupeHandler() {
  chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      if(changeInfo.url) {
        // check if any other tabs with different Ids exist with same URL
        chrome.tabs.query({'url': changeInfo.url}, function(tabs) {
          if(tabs.length == 2 && changeInfo.url != "chrome://newtab/") {
            var oldTab = tabs[0].id == tabId ? tabs[1] : tabs[0];
            // this is a new duplicate
            var dedupe = confirm(
                "Duplicate tab opened. Would you like to switch to the existing tab instead?");
            if(dedupe) {
              // switch to existing tab and make it active
              chrome.tabs.update(oldTab.id, {'active': true}, function() {
                // make sure the window of that tab is also made active
                chrome.windows.update(oldTab.windowId, {'focused': true}, function() {
                  // and kill the newly opened tab
                  chrome.tabs.remove(tabId);
                });
              });
            }
          }
        });
      }
    });
};

function registerTabJanitor(days) {
  /** every X minutes, detect old unused tabs and remove them */
  setInterval(function() {
    var keys = Object.keys(tab_activation_history);
    var now = Date.now();
    keys.forEach(function(tabId) {
      var ts = tab_activation_history[tabId];
      if (ts - now > (1000 * 60 * 60 * 24 * days)) {
        // tab was not activated for 5 days
        // chrome.tabs.remove(tabId); disabled for safety
      }
    });
  }, 1000*60*60);
};

/* keeps track of the last timestamp each tab was activated */
var tab_activation_history = {};
chrome.tabs.onActivated.addListener(function(activeInfo) {
  // store timestamp in ms
  tab_activation_history[activeInfo.tabId] = Date.now();
});

function init() {
  // action taken when a new tab is opened.
  chrome.tabs.onCreated.addListener(function(tab) {
    getAllStats(displayResults);
  });

  // action taken when a tab is closed
  chrome.tabs.onRemoved.addListener(function(tab) {
    getAllStats(displayResults);
  });

  // action taken when a new window is opened
  chrome.windows.onCreated.addListener(function(tab) {
    getAllStats(displayResults);
  });

  // action taken when a windows is closed
  chrome.windows.onRemoved.addListener(function(tab) {
    getAllStats(displayResults);
  });

  // to change badge text on switching current tab
  chrome.windows.onFocusChanged.addListener(function(tab) {
    getAllStats(displayResults);
  });

  // initialize the stats to start off with
  getAllStats(displayResults);

  // activate tab de-dupe detector if enabled in options
  if (localStorage["tabDedupe"]) {
    registerTabDedupeHandler();
  }

  // activate tab janitor if enabled
  if (localStorage["tabJanitor"]) {
    registerTabJanitor(localStorage["tabJanitorDays"]);
  }
}

// initialize the extension
init();
