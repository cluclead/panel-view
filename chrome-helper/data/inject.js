'use strict';

window.addEventListener('message', (e) => {
  chrome.runtime.sendMessage(e.data);
});

// watching title changes
let script = document.createElement('script');
script.textContent = `
  var _title;
  Object.defineProperty(document, 'title', {
    enumerable: true,
    configurable: true,
    get: function () {
      return _title;
    },
    set: function (val) {
      _title = val;
      window.postMessage({cmd: 'title-changed', title: val}, '*');
    }
  });
  window.postMessage({cmd: 'update'}, '*');
`;
document.body.appendChild(script);
