'use strict';

// WebExtensions compatibilty
// See here: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities
if (!chrome) {
  chrome = browser;
}

chrome.runtime.onMessage.addListener((request, sender) => {
    if (sender.tab) {
        return;
    }
    if (!request.changeFont) {
        return;
    }
    
    const bodyElement = document.querySelector('body');
    for (const className of bodyElement.classList) {
        if (className.startsWith('persian-twitter')) {
            bodyElement.classList.remove(className);
        }
    }
    const fontName = request.changeFont.font;    
    bodyElement.classList.add(`persian-twitter-${fontName}`);
});