'use strict';

// WebExtensions compatibilty
// See here: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities
if (!chrome) {
  chrome = browser;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && (tab.url.startsWith('https://twitter.com') || tab.url === 'https://tweetdeck.twitter.com/')) {
    chrome.pageAction.show(tabId);    
  }
  if (!changeInfo || changeInfo.status !== 'complete') {
    return;
  }
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (!tabs || !tabs.length) {
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id, {changeFont: {
      font: localStorage.getItem('persian-twitter-font') || 'default'
    }});
  });
});