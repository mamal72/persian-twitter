'use strict';

// WebExtensions compatibilty
// See here: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities
if (!chrome) {
  chrome = browser;
}

const manifestData = chrome.runtime.getManifest();
const urlPatterns = manifestData.content_scripts[0].matches;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, currentTab) => {
  if (currentTab.url && (currentTab.url.startsWith('https://twitter.com') || currentTab.url === 'https://tweetdeck.twitter.com/')) {
    chrome.pageAction.show(tabId);    
  }
  if (!changeInfo || changeInfo.status !== 'complete') {
    return;
  }
  chrome.tabs.query({url: urlPatterns}, function(tabs) {
    if (!tabs.length) {
      return;
    }
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, {changeFont: {
        font: localStorage.getItem('persian-twitter-font') || 'default',
        fixedFontSize: localStorage.getItem('persian-twitter-fixed-font-size') || 0
      }});
    }
  });
});