'use strict';

window.addEventListener('message', e => {
  chrome.runtime.sendMessage(e.data);
});

// watching title changes
var script = document.createElement('script');
script.textContent = `
  var _play = Audio.prototype.play;
  var _title, _notification = "granted";
  Audio.prototype.play = function () {
    if (_notification === "granted") {
      _play.apply(this);
    }
  }
  Object.defineProperty(Notification, 'permission', {
    enumerable: true,
    configurable: true,
    get: function () {
      return _notification;
    }
  });
  window.addEventListener('message', (e) => {
    if (e.data && e.data.cmd === 'notification-permission') {
      _notification = e.data.value;
      window.postMessage({cmd: 'title-changed', title: document.title}, '*');
    }
  });
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
