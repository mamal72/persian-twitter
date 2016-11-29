'use strict';

const selectFontElement = document.querySelector('#persian-twitter-font');
const currentFont = localStorage.getItem('persian-twitter-font') || 'default';
selectFontElement.value = currentFont;

const links = document.querySelectorAll('a');
for (const link of links) {
  link.addEventListener('click', e => {
    e.preventDefault();

    chrome.tabs.create({
      url: link.href
    });
  });
}

selectFontElement.addEventListener('change', () => {
  const font = selectFontElement.value;
  localStorage.setItem('persian-twitter-font', font);
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {changeFont: {
      font
    }});
  });
});