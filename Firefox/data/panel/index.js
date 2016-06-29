/* globals self */
'use strict';

document.addEventListener('click', function (e) {
  let cmd = e.target.dataset.cmd;
  let value = e.target.dataset.value;
  if (cmd) {
    self.port.emit(cmd, value);
  }
});
