'use strict';

var badge = document.querySelector('[data-badge]');
var options = document.getElementById('options');
var webview = document.querySelector('webview');

var config = {
  badge: true,
  notification: true,
  media: true
};
// storage
function update() {
  chrome.storage.local.get({
    'whatsapp.badge': true,
    'whatsapp.media': true,
    'whatsapp.notification': true
  }, prefs => {
    config.badge = prefs['whatsapp.badge'];
    config.notification = prefs['whatsapp.notification'];
    config.media = prefs['whatsapp.media'];
    webview.contentWindow.postMessage({
      cmd: 'notification-permission',
      value: config.notification ? 'granted' : 'denied'
    }, '*');
  });
}
chrome.storage.onChanged.addListener(update);
// webview
webview.addEventListener('permissionrequest', e => {
  if (e.permission === 'media') {
    if (config.media) {
      e.request.allow();
    }
    else {
      e.request.deny();
    }
  }
  else if (e.permission === 'filesystem') {
    e.request.allow();
  }
});
webview.addEventListener('newwindow', e => {
  const url = e.targetUrl;
  if (url) {
    chrome.browser.openTab({url});
  }
});

chrome.runtime.onMessage.addListener(message => {
  if (message.cmd === 'title-changed') {
    const value = /\((\d+)\)/.exec(message.title);
    badge.dataset.badge = value && value.length && config.badge ? value[1] : 0;
    //chrome.app.window.current().setIcon('./data/icons/message/128.png')
    chrome.runtime.sendMessage('ngblblklhhjbgihpcoaanbchheneglbj', {
      cmd: 'update-badge',
      value: value && value.length ? value[1] : 0
    });
  }
  else if (message.cmd === 'update') {
    update();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  webview.addContentScripts([{
    name:'inject',
    matches: [
      '*://web.whatsapp.com/*'
    ],
    run_at: 'document_idle',
    js: {
      files: ['data/window/inject.js']
    },
  }]);
  webview.setAttribute('src', 'https://web.whatsapp.com/');
});

document.addEventListener('click', e => {
  const cmd = e.target.dataset.cmd;
  if (cmd === 'refresh') {
    webview.setAttribute('src', 'about:blank');
    webview.setAttribute('src', 'https://web.whatsapp.com/');
  }
  else if (cmd === 'settings') {
    options.style.display = 'flex';
  }
  else if (cmd === 'open') {
    chrome.browser.openTab({
      url: e.target.dataset.value
    });
  }
});

options.addEventListener('click', () => {
  options.style.display = 'none';
});
