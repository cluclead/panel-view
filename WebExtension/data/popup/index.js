'use strict';

var iframe = document.querySelector('iframe');
var badge = document.querySelector('[data-badge]');

chrome.runtime.onMessage.addListener(request => {
  if (request.method === 'title-changed') {
    const value = /\((\d+)\)/.exec(request.title);
    badge.dataset.badge = value && value.length ? value[1] : 0;
  }
});

document.addEventListener('click', function (e) {
  const cmd = e.target.dataset.cmd;
  if (cmd === 'refresh') {
    iframe.setAttribute('src', 'about:blank');
    iframe.setAttribute('src', 'https://web.whatsapp.com/');
  }
  else if (cmd === 'open') {
    chrome.tabs.create({
      url: e.target.dataset.value
    }, () => window.close());
  }
});

chrome.webRequest.onHeadersReceived.addListener(info => {
  const responseHeaders = info.responseHeaders;
  for (let i = responseHeaders.length - 1; i >= 0; --i) {
    const header = responseHeaders[i].name.toLowerCase();
    if (header === 'x-frame-options' || header === 'frame-options') {
      responseHeaders.splice(i, 1); // Remove header
    }
  }
  return {responseHeaders};
},
  {
    urls: ['*://web.whatsapp.com/*'],
    types: ['sub_frame']
  },
  ['blocking', 'responseHeaders']
);

document.addEventListener('DOMContentLoaded', () => {
  window.setTimeout(() => {
    iframe.src = 'https://web.whatsapp.com/?rand=' + Math.round(Math.random() * 10000000);
  }, 0);
});
