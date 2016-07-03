'use strict';

document.addEventListener('DOMContentLoaded', function () {
  self.port.emit('title', document.title);
  document.watch('title', (id, o, data) => {
    chrome.extension.sendRequest({
      method: 'title',
      data
    });
    return data;
  });
});

chrome.extension.onRequest.addListener(function (request) {
  if (request.method === 'activate') {
    try {
      document.querySelector('.popup-container .btn-default').click();
    }
    catch (e) {}
  }
});
