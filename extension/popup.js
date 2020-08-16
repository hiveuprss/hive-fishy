// popup.js

chrome.runtime.sendMessage({greeting: "getInfo"}, function(response) {
  document.querySelector('#accountname').value = response.accountname
  document.querySelector('#hivepower').value = response.hivepower
  document.querySelector('#fishname').value = response.fishname
});