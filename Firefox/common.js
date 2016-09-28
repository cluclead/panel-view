'use strict';

var {ToggleButton} = require('sdk/ui/button/toggle');
var tabs = require('sdk/tabs');
var panels = require('sdk/panel');
var self = require('sdk/self');
var unload = require('sdk/system/unload');
var sp = require('sdk/simple-prefs');
var timers = require('sdk/timers');
var array = require('sdk/util/array');
var utils = require('sdk/window/utils');
var {Cc, Ci} = require('chrome');
var {getActiveView} = require('sdk/view/core');
var Worker = require('sdk/content/worker').Worker;  // jshint ignore:line

var panel, button, browser, workers = [], config = {
  audio: sp.prefs['audio-permission'],
  video: sp.prefs['video-permission'],
  picture: sp.prefs['picture-permission']
};

function update (title) {
  let tmp = /\((\d+)\)/.exec(title);
  if (tmp && tmp.length) {
    button.badge = tmp[1];
    button.label = title;
  }
  else {
    button.badge = '';
    button.label = 'WhatsApp Messenger';
  }
}

button = new ToggleButton({
  id: self.name,
  label: 'WhatsApp Messenger',
  icon: {
    '16': './icons/toolbar/16.png',
    '32': './icons/toolbar/32.png',
    '64': './icons/toolbar/64.png'
  },
  onChange: state => state.checked && panel.show({
    position: button
  })
});

panel = panels.Panel({
  contentURL: self.data.url('./panel/index.html'),
  contentScriptFile: self.data.url('./panel/index.js'),
  contentScriptOptions: {
    permissions: config
  },
  width: 40,
  height: sp.prefs.height,
  contextMenu: true,
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
panel.port.on('settings', () => {
  panel.hide();
  utils.getMostRecentBrowserWindow().BrowserOpenAddonsMgr('addons://detail/' + self.id);
});
panel.port.on('pin', bol => getActiveView(panel).setAttribute('noautohide', bol));
panel.port.on('audio-permission', bol => {
  config.audio = bol === 'true';
  sp.prefs['audio-permission'] = config.audio;
});
panel.port.on('video-permission', bol => {
  config.video = bol === 'true';
  sp.prefs['video-permission'] = config.video;
});
panel.port.on('picture-permission', bol => {
  config.picture = bol === 'true';
  sp.prefs['picture-permission'] = config.picture;
});
panel.port.on('init', () => {
  let panelView = getActiveView(panel);
    // display tooltips
    panelView.setAttribute('tooltip', 'aHTMLTooltip');
    // whatsapp cannot be loaded in an iframe; we use a safe browser element (type=content)
    let document = panelView.ownerDocument;
    browser = document.createElement('browser');
    browser.setAttribute('type', 'content');
    panelView.appendChild(browser);
    browser.addEventListener('DOMContentLoaded', () => {
      let worker = new Worker({
        window: browser.contentWindow,
        contentScriptFile: self.data.url('./inject/inject.js'),
      });
      worker.on('pageshow', () => array.add(workers, worker));
      worker.on('pagehide', () => array.remove(workers, worker));
      worker.on('detach', () => array.remove(workers, worker));
      worker.port.on('title', update);
    });
    browser.setAttribute('src', 'https://web.whatsapp.com/');

    panelView.addEventListener('popupshowing', () => {
      browser.setAttribute('style', `width: ${sp.prefs.width}px; height: ${sp.prefs.height}px;`);
      panel.port.emit('hide');
      if (panelView.firstChild === browser) {
        let iframe = panelView.querySelector('iframe');
        iframe.style.width = '40px';
        panelView.dir = 'reverse';
      }
    });
});

// user permissions
(function () {
  let nsIObserverService = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
  let httpRequestObserver = {
    observe: (subject) => {
      if (!browser) {
        return;
      }
      let windowID = browser.contentWindow
       .QueryInterface(Ci.nsIInterfaceRequestor)
       .getInterface(Ci.nsIDOMWindowUtils)
       .currentInnerWindowID;

      if (subject.innerWindowID !== windowID && subject.windowID !== windowID) {
        return;
      }

      let c = subject.getConstraints();
      let navigator = browser.ownerDocument.defaultView.navigator;
      if ((c.audio && config.audio) || (c.video && config.video) || (c.picture && config.picture)) {
        navigator.mozGetUserMediaDevices(
          c,
          devices =>  {
            let allowedDevices = Cc['@mozilla.org/supports-array;1']
              .createInstance(Ci.nsISupportsArray);
            devices.forEach(d => allowedDevices.AppendElement(d));
            nsIObserverService.notifyObservers(allowedDevices, 'getUserMedia:response:allow', subject.callID);
          },
          e => console.error(e),
          subject.innerWindowID,
          subject.callID
        );
      }
      else {
        nsIObserverService.notifyObservers(null, 'getUserMedia:response:deny', subject.callID);
      }
    }
  };
  nsIObserverService.addObserver(httpRequestObserver, 'getUserMedia:request', false);
  unload.when(() => {
    nsIObserverService.removeObserver(httpRequestObserver, 'getUserMedia:request');
  });
})();

sp.on('width', () => timers.setTimeout(() => {
  sp.prefs.width = Math.max(300, sp.prefs.width);
  browser.setAttribute('style', `width: ${sp.prefs.width}px;`);
}, 2000));
sp.on('height', () => timers.setTimeout(() => {
  sp.prefs.height = Math.max(300, sp.prefs.height);
  panel.height = sp.prefs.height;
}, 2000));

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
      if (sp.prefs.welcome) {
        timers.setTimeout(function () {
          tabs.open(
            'http://add0n.com/whatsapp-messenger.html?v=' + self.version +
            (version ? '&p=' + version + '&type=upgrade' : '&type=install')
          );
        }, 3000);
      }
      sp.prefs.version = self.version;
    }
  }
};
