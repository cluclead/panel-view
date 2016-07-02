/* globals self */
'use strict';

document.addEventListener('click', function (e) {
  let cmd = e.target.dataset.cmd;
  if (cmd) {
    self.port.emit(cmd, e.target.dataset.value);
  }
});
