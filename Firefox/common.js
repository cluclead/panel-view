'use strict';

var {ToggleButton} = require('sdk/ui/button/toggle');
var tabs = require('sdk/tabs');
var panels = require('sdk/panel');
var self = require('sdk/self');
var unload = require('sdk/system/unload');
var sp = require('sdk/simple-prefs');
var timers = require('sdk/timers');
var array = require('sdk/util/array');
var {Cc, Ci} = require('chrome');
var {getActiveView} = require('sdk/view/core');
var Worker = require('sdk/content/worker').Worker;  // jshint ignore:line

var panel, button, browser, workers = [];

function update (title) {
  let tmp = /\((\d+)\)/.exec(title);
  if (tmp && tmp.length) {
    button.badge = tmp[1];
    button.label = title;
  }
  else {
    button.badge = '';
    button.label = 'WhatsApp™ Messenger';
  }
}
// inject script into the panel -> browser element
(function () {
  let nsIObserverService = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
  let httpRequestObserver = {
    observe: function(subject) {
      let window = subject.defaultView;
      if (window && window.location.href === 'https://web.whatsapp.com/') {
        let worker = new Worker({
          window,
          contentScriptFile: self.data.url('./inject/inject.js'),
        });
        worker.on('pageshow', () => array.add(workers, worker));
        worker.on('pagehide', () => array.remove(workers, worker));
        worker.on('detach', () => array.remove(workers, worker));
        worker.port.on('title', update);
      }
    }
  };
  nsIObserverService.addObserver(httpRequestObserver, 'document-element-inserted', false);
  unload.when(function () {
    nsIObserverService.removeObserver(httpRequestObserver, 'document-element-inserted');
  });
})();

button = new ToggleButton({
  id: self.name,
  label: 'WhatsApp™ Messenger',
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
  // whatsapp cannot be loaded in an iframe; we use a safe browser element (type=content)
  let b = panelView.ownerDocument.createElement('browser');
  b.setAttribute('type', 'content');
  b.setAttribute('style', 'width: 660px;');
  panelView.appendChild(b);
  b.setAttribute('src', 'https://web.whatsapp.com/');
  return b;
})(getActiveView(panel));

// reactivate WhatsApp if tab is closed
tabs.on('close', function (tab) {
  if(tab.url === 'https://web.whatsapp.com' || tab.url === 'https://web.whatsapp.com/') {
    workers.forEach(w => w.port.emit('activate'));
  }
});
// FAQs page
exports.main = function (options) {
  if (options.loadReason === 'install' || options.loadReason === 'startup') {
    let version = sp.prefs.version;
    if (self.version !== version) {
      timers.setTimeout(function () {
        tabs.open(
          'http://add0n.com/whatsapp-messenger.html?v=' + self.version +
          (version ? '&p=' + version + '&type=upgrade' : '&type=install')
        );
      }, 3000);
      sp.prefs.version = self.version;
    }
  }
};
