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
    const fixedFontSizeStatus = request.changeFont.fixedFontSize;
    const fontName = request.changeFont.font;
    if (fixedFontSizeStatus && !bodyElement.classList.contains('persian-twitter-fixed-font-size')) {
      bodyElement.classList.add('persian-twitter-fixed-font-size');
    }
    if (!fixedFontSizeStatus && bodyElement.classList.contains('persian-twitter-fixed-font-size')) {
      bodyElement.classList.remove('persian-twitter-fixed-font-size');
    }
    const newClassName = `persian-twitter-${fontName}`;
    if (bodyElement.classList.contains(newClassName)) {
        return;
    }
    for (const className of bodyElement.classList) {
        if (className.startsWith('persian-twitter') && className !== 'persian-twitter-fixed-font-size') {
            bodyElement.classList.remove(className);
        }
    }
    bodyElement.classList.add(newClassName);
});