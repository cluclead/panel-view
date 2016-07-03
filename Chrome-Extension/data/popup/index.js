'use strict';

var iframe = document.querySelector('iframe');
iframe.src = 'https://web.whatsapp.com/';

document.addEventListener('click', function (e) {
  let cmd = e.target.dataset.cmd;
  if (cmd === 'refresh') {
    iframe.setAttribute('src', 'about:blank');
    iframe.setAttribute('src', 'https://web.whatsapp.com/');
  }
});
