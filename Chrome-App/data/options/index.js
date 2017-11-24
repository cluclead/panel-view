'use strict';

function restore () {
  chrome.storage.local.get({
    'whatsapp.badge': true,
    'whatsapp.media': true,
    'whatsapp.notification': true
  }, (items) => {
    document.getElementById('whatsapp.badge').checked = items['whatsapp.badge'];
    document.getElementById('whatsapp.media').checked = items['whatsapp.media'];
    document.getElementById('whatsapp.notification').checked = items['whatsapp.notification'];
  });
}

function save () {
  chrome.storage.local.set({
    'whatsapp.badge':  document.getElementById('whatsapp.badge').checked,
    'whatsapp.media':  document.getElementById('whatsapp.media').checked,
    'whatsapp.notification':  document.getElementById('whatsapp.notification').checked
  }, function() {
    let status = document.getElementById('status');
    status.textContent = 'Options are saved';
    restore();
    setTimeout(() => status.textContent = '', 750);
  });
}

document.addEventListener('DOMContentLoaded', restore);
document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  save();
});
