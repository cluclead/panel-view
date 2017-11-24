/* globals unsafeWindow, self */
'use strict';

self.port.emit('title', document.title);
// watch for title changes; needs to access unsafeWindow to bypass Proxy
unsafeWindow.document.watch('title', (id, o, n) => {
  self.port.emit('title', n);
  return n;
});

var notification = 'granted';

Object.defineProperty(unsafeWindow.Notification, 'permission', {
  enumerable: true,
  configurable: true,
  get: function () {
    return notification;
  }
});
var play = unsafeWindow.Audio.prototype.play;
unsafeWindow.Audio.prototype.play = function () {
  if (notification === 'granted') {
    play.apply(this);
  }
};
self.port.on('prefs', obj => {
  notification = obj.permissions.notification ? 'granted' : 'denied';
  self.port.emit('title', document.title);
});
self.port.on('activate', function () {
  try {
    document.querySelector('.popup-container .btn-default').click();
  }
  catch (e) {}
});
