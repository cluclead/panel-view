'use strict';

function notify (message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: './data/icons/64.png',
    title: 'WhatsApp Helper Extension',
    message
  });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.cmd === 'title-changed') {
    let value = /\((\d+)\)/.exec(request.title);
    chrome.browserAction.setBadgeText({
      text: value ? value[1] + '' : ''
    });
  }
});
chrome.runtime.onMessageExternal.addListener((request) => {
  if (request.cmd === 'update-badge') {
    chrome.browserAction.setBadgeText({
      text: request.value ? request.value + '' : ''
    });
  }
});

chrome.browserAction.onClicked.addListener(() => {
  chrome.management.get('infelompnbbancffeibkenmdbbmpoged', (info) => {
    if (info) {
      if (info.enabled) {
        chrome.management.launchApp('infelompnbbancffeibkenmdbbmpoged');
      }
      else {
        notify('Your "WhatsApp™ Messenger" packaged application is disabled');
        chrome.tabs.create({
          url: 'chrome://extensions/?id=infelompnbbancffeibkenmdbbmpoged'
        });
      }
    }
    else {
      notify('Please install "WhatsApp™ Messenger" packaged application to proceed');
      chrome.tabs.create({
        url: 'https://chrome.google.com/webstore/detail/infelompnbbancffeibkenmdbbmpoged'
      });
    }
  });
});
