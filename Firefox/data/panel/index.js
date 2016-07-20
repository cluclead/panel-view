/* globals self */
'use strict';

document.addEventListener('click', function (e) {
  let cmd = e.target.dataset.cmd;
  if (cmd === 'pin') {
    e.target.dataset.value = e.target.dataset.value === 'false' ? 'true' : 'false';
  }
  if (cmd) {
    self.port.emit(cmd, e.target.dataset.value);
  }
});
