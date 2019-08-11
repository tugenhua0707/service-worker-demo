// 加载css样式
require('../styles/main.styl');

// 加载js
require('./store.js');
require('./myAccount.js');

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register('/sw.js', {scope: '/'}).then(function(registration) {
    console.log("Service Worker registered with scope: ", registration.scope);
  }).catch(function(err) {
    console.log("Service Worker registered failed:", err);
  });
}
/*
if ("serviceWorker" in navigator && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener("message", function(event) {
    console.log(event.data);
  })
}
*/

import $ from 'jquery';

$(function(){
  if ("serviceWorker" in navigator && navigator.serviceWorker) {
    console.log(navigator.serviceWorker.controller);
    $('#logout').click(function(e) {
      e.preventDefault();
      navigator.serviceWorker.controller.postMessage({
        action: "logout"
      });
    });
    navigator.serviceWorker.addEventListener("message", function(event) {
      var data = event.data;
      if (data.action === "navigate") {
        window.location.href = data.url;
      }
    });
  }
});

























