'use strict';

var {ToggleButton} = require('sdk/ui/button/toggle');
var tabs = require('sdk/tabs');
var panels = require('sdk/panel');
var self = require('sdk/self');
var {getActiveView} = require('sdk/view/core');
var events = require('sdk/system/events');
var Worker = require('sdk/content/worker').Worker;  // jshint ignore:line

var panel, button, browser;

function update (title) {
  let tmp = /\((\d+)\)/.exec(title);
  console.error(title, tmp);
  if (tmp && tmp.length) {
    button.badge = tmp[1];
  }
  else {
    button.badge = '';
  }
}
events.on('document-element-inserted', function listener (e) {
  let window = e.subject.defaultView;
  if (window && window.location.href === 'https://web.whatsapp.com/') {
    let worker = new Worker({
      window,
      contentScriptFile: self.data.url('./inject/inject.js'),
    });
    worker.port.on('title', update);
  }
});

button = new ToggleButton({
  id: self.name,
  label: 'WhatsApp Web',
  icon: {
    '18': './icons/18.png',
    '36': './icons/36.png',
    '64': './icons/64.png'
  },
  onChange: state => state.checked && panel.show({
    position: button
  })
});

panel = panels.Panel({
  contentURL: self.data.url('./panel/index.html'),
  contentScriptFile: self.data.url('./panel/index.js'),
  width: 40,
  height: 500,
  onHide: () => button.state('window', {checked: false})
});
panel.port.on('open', (url) => {
  panel.hide();
  tabs.open(url);
});
panel.port.on('refresh', () => {
  browser.src = 'https://web.whatsapp.com/';
  browser.reload();
});

browser = (function (panelView) {
  // whatsapp cannot be loaded in an iframe; we will create a safe browser element
  let b = panelView.ownerDocument.createElement('browser');
  b.setAttribute('type', 'content');
  b.setAttribute('style', 'width: 700px; height: 500px;');
  panelView.appendChild(b);
  b.setAttribute('src', 'https://web.whatsapp.com/');
  return b;
})(getActiveView(panel));
