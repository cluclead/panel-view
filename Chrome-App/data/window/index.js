'use strict';

var badge = document.querySelector('[data-badge]');
var webview = document.querySelector('webview');
webview.addEventListener('permissionrequest', (e) => {
  if (e.permission === 'media') {
    e.request.allow();
  }
});
webview.addEventListener('loadstop', (e) => {
  e.target.executeScript({
    code: `
if (document.body.dataset.installed !== 'true') {
  var appWindow;
  window.addEventListener('message', (e) => {
    if (e.data === 'app-init') {
      appWindow = event.source;
    }
    if (e.data.cmd === 'title-changed' && appWindow) {
      appWindow.postMessage(e.data, '*');
    }
  });
  // watching title changes
  var script = document.createElement('script');
  script.textContent = '' +
  'var _title;' +
  'Object.defineProperty(document, "title", {' +
  '  enumerable: true,' +
  '  configurable: true,' +
  '  get: function () {' +
  '    return _title;' +
  '  },' +
  '  set: function (val) {' +
  '    _title = val;' +
  '    window.postMessage({cmd: "title-changed", title: val}, "*");' +
  '  }' +
  '});';
  document.body.appendChild(script);
  document.body.dataset.installed = true;
}
    `
  });
  e.target.contentWindow.postMessage('app-init', '*');
});

window.addEventListener('message', e => {
  if (e.data.cmd === 'title-changed') {
    let val = /\((\d+)\)/.exec(e.data.title);
    badge.dataset.badge = val && val.length ? val[1] : 0;
    //chrome.app.window.current().setIcon('./data/icons/message/128.png')
  }
});


webview.setAttribute('src', 'https://web.whatsapp.com/');

document.addEventListener('click', (e) => {
  let cmd = e.target.dataset.cmd;
  if (cmd === 'refresh') {
    webview.setAttribute('src', 'about:blank');
    webview.setAttribute('src', 'https://web.whatsapp.com/');
  }
  else {
    chrome.runtime.sendMessage({
      method: cmd,
      data: e.target.dataset.value
    });
  }
});
