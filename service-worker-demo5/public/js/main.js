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





















