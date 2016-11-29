'use strict';

chrome.runtime.onMessage.addListener((request, sender) => {
    console.log('request', request);
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