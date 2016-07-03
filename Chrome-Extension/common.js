'use strict';

chrome.webRequest.onHeadersReceived.addListener(
  function(info) {
    let responseHeaders = info.responseHeaders;
    for (let i = responseHeaders.length-1; i >= 0; --i) {
        let header = responseHeaders[i].name.toLowerCase();
        if (header === 'x-frame-options' || header === 'frame-options') {
          responseHeaders.splice(i, 1); // Remove header
        }
    }
    return {responseHeaders};
  },
  {
    urls: ['<all_urls>'],
    types: ['sub_frame']
  },
  ['blocking', 'responseHeaders']
);
