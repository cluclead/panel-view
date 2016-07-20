'use strict';

var {ToggleButton} = require('sdk/ui/button/toggle');
var tabs = require('sdk/tabs');
var panels = require('sdk/panel');
var self = require('sdk/self');
var sp = require('sdk/simple-prefs');
var timers = require('sdk/timers');
var utils = require('sdk/window/utils');
var {getActiveView} = require('sdk/view/core');
var Worker = require('sdk/content/worker').Worker;  // jshint ignore:line

var panel, button, browser;

button = new ToggleButton({
  id: self.name,
  label: 'Skype™ Web',
  icon: {
    '16': './icons/16.png',
    '32': './icons/32.png',
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
  height: sp.prefs.height,
  onHide: () => button.state('window', {checked: false})
});
panel.port.on('open', (url) => {
  panel.hide();
  tabs.open(url);
});
panel.port.on('refresh', () => {
  browser.src = 'https://web.skype.com/';
  browser.reload();
});
panel.port.on('settings', () => {
  panel.hide();
  utils.getMostRecentBrowserWindow().BrowserOpenAddonsMgr('addons://detail/' + self.id);
});
panel.port.on('pin', function (bol) {
  getActiveView(panel).setAttribute('noautohide', bol);
});

browser = (function (panelView) {
  // display tooltips
  panelView.setAttribute('tooltip', 'aHTMLTooltip');
  let b = panelView.ownerDocument.createElement('browser');
  b.setAttribute('type', 'content');
  b.setAttribute('style', `width: ${sp.prefs.width}px;`);
  panelView.appendChild(b);
  b.setAttribute('src', 'https://web.skype.com/');
  return b;
})(getActiveView(panel));

sp.on('width', () => timers.setTimeout(() => {
  sp.prefs.width = Math.max(300, sp.prefs.width);
  browser.setAttribute('style', `width: ${sp.prefs.width}px;`);
}, 2000));
sp.on('height', () => timers.setTimeout(() => {
  sp.prefs.height = Math.max(300, sp.prefs.height);
  panel.height = sp.prefs.height;
}, 2000));

// FAQs page
exports.main = function (options) {
  if (options.loadReason === 'install' || options.loadReason === 'startup') {
    let version = sp.prefs.version;
    if (self.version !== version) {
      timers.setTimeout(function () {
        tabs.open(
          'http://add0n.com/skype-web.html?v=' + self.version +
          (version ? '&p=' + version + '&type=upgrade' : '&type=install')
        );
      }, 3000);
      sp.prefs.version = self.version;
    }
  }
};
