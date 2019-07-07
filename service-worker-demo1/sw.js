/*
console.log(self);

self.addEventListener("fetch", function(e) {
  console.log("Fetch request for: ", e.request.url);
});
*/
/*
var responseContent = `<html>
  <body>
    <head>
      <meta charset="UTF-8">
      <title>service+worker异常</title>
      <style>body{color:red;font-size:18px;}</style>
    </head>
    <h2>service worker异常的处理</h2>
  </body>
`

self.addEventListener("fetch", function(event) {
  console.log(event.request);
  event.respondWith(
    fetch(event.request).catch(function() {
      return new Response(
        responseContent,
        {headers: {"Content-Type": "text/html"}}
      )
    })
  );
});
*/
/*
// 监听install的事件
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open("cacheName").then(function(cache) {
      return cache.add("/public/index.html");
    })
  )
});
*/
/*
var CACHE_NAME = "cacheName";
var CACHE_URLS = [
  "/public/index.html",
  "/main.css",
  "/public/images/xxx.jpg"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_URLS);
    })
  )
});

// 监听fetch事件
self.addEventListener("fetch", function(e) {
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request).then(function(response) {
        if (response) {
          return response;
        } else if (e.request.headers.get("accept").includes("text/html")) {
          return caches.match("/public/index.html");
        }
      })
    })
  )
});
*/

var CACHE_NAME = "cacheName";
var immutableRequests = [
  "/main.css",
  "/public/images/xxx.jpg"
];

var mutableRequests = [
  "/public/index.html"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      var newImmutableRequests = [];
      return Promise.all(
        immutableRequests.map(function(url) {
          return caches.match(url).then(function(response) {
            if (response) {
              return cache.put(url, response);
            } else {
              newImmutableRequests.push(url);
              return Promise.resolve();
            }
          });
        })
      ).then(function(){
        return cache.addAll(newImmutableRequests.concat(mutableRequests));
      })
    })
  )
});

// 监听fetch事件
self.addEventListener("fetch", function(e) {
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request).then(function(response) {
        if (response) {
          return response;
        } else if (e.request.headers.get("accept").includes("text/html")) {
          return caches.match("/public/index.html");
        }
      })
    })
  )
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName && cacheName.startWith("cacheName")) {
            return caches.delete(cacheName);
          }
        })
      )
    })
  )
});


