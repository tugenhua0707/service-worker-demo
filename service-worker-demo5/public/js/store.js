
import axios from 'axios';

var DB_VERSION = 1;
var DB_NAME = 'store-data2';

var openDataBase = function() {
  return new Promise(function(resolve, reject) {
    if (!window.indexedDB) {
      reject("indexedDB not supported");
    }
    // 打开或创建 store-data 数据库
    var result = window.indexedDB.open(DB_NAME, DB_VERSION);

    // 监听error函数触发
    result.onerror = function(event) {
      console.log("DataBase error:", event.target.error);
    }
    // 监听当前版本号被升级的时候触发该函数
    result.onupgradeneeded = function(event) {
      var db = event.target.result;
      /*
       是否包含该对象仓库名(或叫表名)。如果不包含就创建一个。
       该对象中的 keyPath属性id为主键
      */
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore("store", { keyPath: "id", autoIncrement: true });
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

var getStore = function (successCallback) {

  return new Promise(function(resolve, reject) {
    openDataBase().then(function(db) {
      var objectStore = openObjectStore(db, 'store');
      var datas = [];
      objectStore.openCursor().onsuccess = function(event) {
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
    axios.get("http://localhost:8081/public/json/index.json", resolve);
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
  return new Promise(function(resolve, reject) {
    openDataBase().then(function(db) {
      openObjectStore(db, storeName, "readwrite").openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (!cursor) {
          reject("store-data not found");
        }
        if (cursor.value.id === id) {
          cursor.put(object).onsuccess = resolve;
          return;
        }
        cursor.continue();
      }
    }).catch(function(){
      reject(error);
    })
  });
}

window.openDataBase = openDataBase;
window.openObjectStore = openObjectStore;

window.addToObjectStore = addToObjectStore;
window.updateInObjectStore = updateInObjectStore;

window.getStore = getStore;
