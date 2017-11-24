'use strict';

var title;

document.addEventListener('DOMContentLoaded', () => {
  title = document.title;
  Object.defineProperty(document, 'title', {
    enumerable: true,
    configurable: true,
    get() {
      return title;
    },
    set(data) {
      title = data;
      chrome.runtime.sendMessage({
        method: 'title-changed',
        title
      });
    }
  });

  chrome.runtime.sendMessage({
    method: 'title-changed',
    title
  });
});
