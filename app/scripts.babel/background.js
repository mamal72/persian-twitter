'use strict';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && (tab.url.startsWith('https://twitter.com') || tab.url === 'https://tweetdeck.twitter.com/')) {
    chrome.pageAction.show(tabId);    
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