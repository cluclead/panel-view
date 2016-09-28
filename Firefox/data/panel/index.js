/* globals self */
'use strict';

var pin = document.querySelector('[data-cmd="pin"]');

document.addEventListener('click', function (e) {
  let cmd = e.target.dataset.cmd;
  if (cmd === 'pin') {
    e.target.dataset.value = e.target.dataset.value === 'false' ? 'true' : 'false';
  }
  if (cmd === 'audio-permission') {
    e.target.dataset.value = !document.getElementById('cb_a').checked;
  }
  if (cmd === 'video-permission') {
    e.target.dataset.value = !document.getElementById('cb_v').checked;
  }
  if (cmd === 'picture-permission') {
    e.target.dataset.value = !document.getElementById('cb_p').checked;
  }
  if (cmd) {
    self.port.emit(cmd, e.target.dataset.value);
  }
});
// reseting pin if window gets hide for any reason
self.port.on('hide', () => pin.dataset.value = 'false');
// permissions
document.getElementById('cb_a').checked = self.options.permissions.audio;
//document.getElementById('cb_v').checked = self.options.permissions.video;
//document.getElementById('cb_p').checked = self.options.permissions.picture;

// init WhatsApp 3 seconds
window.setTimeout(() => self.port.emit('init'), 0);
