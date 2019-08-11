
importScripts("/public/js/store.js");
var CACHE_NAME = "cacheName";

var CACHE_URLS = [
  "/public/index.html",      // html文件
  "/main.css",               // css 样式表
  "/public/images/xxx.jpg",  // 图片
  "/main.js",                 // js 文件 
  "/public/js/store.js"
];

// 监听 install 事件，把所有的资源文件缓存起来
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_URLS);
    }).then(function(){
      return self.clients.matchAll({includeUncontrolled: true});
    }).then(function(clients){
      console.log(clients);
      clients.forEach(function(client) {
        client.postMessage('hello world' + client.id);
      });
    })
  )
});

// 监听fetch事件，监听所有的请求

self.addEventListener("fetch", function(event) {
  var requestURL = new URL(event.request.url);
  if (requestURL.pathname === '/' || requestURL.pathname === "/index.html") {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match("/index.html").then(function(cachedResponse) {
          var fetchPromise = fetch("/index.html").then(function(networkResponse) {
            cache.put("/index.html", networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        })
      })
    )
  } else if (CACHE_URLS.includes(requestURL.href) || CACHE_URLS.includes(requestURL.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(response) {
          return response || fetch(event.request);
        });
      })
    )
  } 
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

var createStoreUrl = function(storeDetails) {
  var storeUrl = new URL("http://localhost:8082/public/json/index.json");
  Object.keys(storeDetails).forEach(function(key) {
    storeUrl.searchParams.append(key, storeDetails[key]);
  });
  return storeUrl;
};

// 新增的代码：
var postStoreDetails = function(data) {
  self.clients.matchAll({ includeUncontrolled: true }).then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage({
        action: 'update-store',
        data: data
      })
    });
  });
};
var syncStores = function() {
  return getStore().then(function(reservations) {
    console.log(reservations);
    return Promise.all(
      reservations.map(function(reservation){
        var reservationUrl = createStoreUrl(reservation);
        return fetch(reservationUrl).then(function(response) {
          return response.json();
        }).then(function(newResponse) {
          return updateInObjectStore("store", 1, newResponse).then(function() {
            // 新增的代码如下：
            postStoreDetails(newResponse);

          })
        })
      })
    )
  });
};

self.addEventListener("sync", function(event) {
  if (event.tag === "sync-store") {
    console.log('sync-store')
    event.waitUntil(syncStores());
  }
});

// service worker 代码
self.addEventListener("message", function(event) {
  var data = event.data;
  if (data.action === 'logout') {
    self.clients.matchAll().then(function(clients) {
      clients.forEach(function(client) {
        console.log(client.url);
        if (client.url.includes("http://localhost:8082/index.html")) {
          client.postMessage({
            action: "navigate",
            url: 'http://www.baidu.com'
          })
        }
      })
    });
  }
});

