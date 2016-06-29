/* globals unsafeWindow, self */
'use strict';

self.port.emit('title', document.title);
document.addEventListener('DOMContentLoaded', function () {
  // watch for title changes; needs to access unsafeWindow to bypass Proxy
  unsafeWindow.document.watch('title', (id, o, n) => self.port.emit('title', n));
});

