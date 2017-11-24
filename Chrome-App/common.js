'use strict';

chrome.app.runtime.onLaunched.addListener(function() {
  const screenWidth = screen.availWidth;
  const screenHeight = screen.availHeight;
  const width = 700;
  const height = 600;

  chrome.app.window.create('data/window/index.html', {
    id: 'iwweb',
    outerBounds: {
      width: width,
      height: height,
      left: Math.round((screenWidth - width) / 2),
      top: Math.round((screenHeight - height) / 2)
    }
  }, win => {
    win.onClosed.addListener(() => {
      chrome.runtime.sendMessage('ngblblklhhjbgihpcoaanbchheneglbj', {
        cmd: 'update-badge',
        value: 0
      });
    });
  });
});

chrome.storage.local.get('version', prefs => {
  const version = chrome.runtime.getManifest().version;
  if (version !== prefs.version) {
    chrome.storage.local.set({version});
    chrome.browser.openTab({
      url: 'http://add0n.com/whatsapp-messenger.html?v=' + version +
        (prefs.version ? '&p=' + prefs.version + '&type=upgrade' : '&type=install')
    });
  }
});
