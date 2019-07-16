// 加载css样式
require('../styles/main.styl');

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register('/sw.js', {scope: '/'}).then(function(registration) {
    console.log("Service Worker registered with scope: ", registration.scope);
  }).catch(function(err) {
    console.log("Service Worker registered failed:", err);
  });
}



















