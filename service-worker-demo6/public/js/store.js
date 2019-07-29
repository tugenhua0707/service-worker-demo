
var DB_VERSION = 5;
var DB_NAME = 'store-data2';

var openDataBase = function() {
  return new Promise(function(resolve, reject) {
    if (!self.indexedDB) {
      reject("indexedDB not supported");
    }
    // 打开或创建 store-data 数据库
    var result = self.indexedDB.open(DB_NAME, DB_VERSION);

    // 监听error函数触发
    result.onerror = function(event) {
      console.log("DataBase error:", event.target.error);
    }
    // 监听当前版本号被升级的时候触发该函数
    result.onupgradeneeded = function(event) {
      var db = event.target.result;
      var upgradeTransaction = event.target.transaction;
      var reservationsStore;
      /*
       是否包含该对象仓库名(或叫表名)。如果不包含就创建一个。
       该对象中的 keyPath属性id为主键
      */
      if (!db.objectStoreNames.contains('store')) {
        reservationsStore = db.createObjectStore("store", { keyPath: "id", autoIncrement: true });
      } else {
        reservationsStore = upgradeTransaction.objectStore("store");
      }
      if (!reservationsStore.indexNames.contains("idx_status")) {
        reservationsStore.createIndex("idx_status", "status", {unique: false});
      }
    }
    result.onsuccess = function(event) {
      resolve(event.target.result);
    }
  });
};
/*
 @param {storeName} 仓库名或表名
 @param {transactionMode} 事务模式 readOnly 只读，readwrite 可读可写
*/
var openObjectStore = function(db, storeName, transactionMode) {
  return db.transaction(storeName, transactionMode).objectStore(storeName);
};

var getStore = function (indexName, indexValue) {

  return new Promise(function(resolve, reject) {
    openDataBase().then(function(db) {
      var objectStore = openObjectStore(db, 'store');
      var datas = [];
      var cursor;
      if (indexName && indexValue) {
        cursor = objectStore.index(indexName).openCursor(indexValue);
        console.log(cursor);
        console.log('------');
      } else {
        cursor = objectStore.openCursor();
      }

      cursor.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          datas.push(cursor.value);
          cursor.continue();
        } else {
          if (datas.length > 0) {
            resolve(datas);
          } else {
            getDataFromServer().then(function(d) {
              openDataBase().then(function(db) {
                var objectStore = openObjectStore(db, "store", "readwrite");
                for (let i = 0; i < datas.length; i++) {
                  objectStore.add(datas[i]);
                }
                resolve(datas);
              });
            });
          }
        }
      }
    }).catch(function() {
      getDataFromServer().then(function(datas) {
        resolve(datas);
      });
    });
  });
};

function getDataFromServer() {
  return new Promise(function(resolve, reject) {
    if (self.$) {
      $.getJSON("http://localhost:8081/public/json/index.json", resolve);
    } else if (self.fetch){
      fetch("http://localhost:8081/public/json/index.json").then(function(response) {
        return response.json();
      }).then(function(reservations) {
        resolve(reservations);
      });
    }
  });
}

var addToObjectStore = function(storeName, object) {
  return new Promise(function(resolve, reject) {
    openDataBase().then(function(db) {
      openObjectStore(db, storeName, 'readwrite').add(object).onsuccess = resolve;
    }).catch(function(error) {
      reject(error);
    })
  });
};

var updateInObjectStore = function(storeName, id, object) {
  console.log(object);
  console.log('object');
  return new Promise(function(resolve, reject) {
    openDataBase().then(function(db) {
      openObjectStore(db, storeName, "readwrite").openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (!cursor) {
          reject("store-data not found");
        }
        if (cursor && cursor.value.id === id) {
          cursor.put(object).onsuccess = resolve;
          return;
        }
        cursor && cursor.continue();
      }
    }).catch(function(){
      reject(error);
    })
  });
}

self.openDataBase = openDataBase;
self.openObjectStore = openObjectStore;

self.addToObjectStore = addToObjectStore;
self.updateInObjectStore = updateInObjectStore;

self.getStore = getStore;