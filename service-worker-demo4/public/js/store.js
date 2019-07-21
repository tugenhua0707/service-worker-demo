
import axios from 'axios';

var openDataBase = function() {
  if (!window.indexedDB) {
    return false;
  }
  // 打开或创建 store-data 数据库
  var result = window.indexedDB.open('store-data', 3);

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
  return result;
};
/*
 @param {storeName} 仓库名或表名
 @param {successCallback} 需要执行的回调函数
 @param {transactionMode} 事务模式 readOnly 只读，readwrite 可读可写
*/
var openObjectStore = function(storeName, successCallback, transactionMode) {
  var db = openDataBase();
  if (!db) {
    return false;
  }
  db.onsuccess = function(event) {
    var targetValue = event.target.result;
    /* 
     1. 使用 targetValue.transaction(storeName, transactionMode) 来创建事务
     2. 创建事务之后，我们使用 targetValue.transaction(storeName, transactionMode).objectStore(storeName)
     这个方法，拿到 IDBObjectStore对象。
    */
    var objectStore = targetValue.transaction(storeName, transactionMode).objectStore(storeName);
    successCallback(objectStore);
  };
  return true;
};

var getStore = function (successCallback) {
  var datas = [];
  var db = openObjectStore("store", function(objectStore) {
    // 使用流标 objectStore.openCursor()
    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      // 如果有流标的话，就把数据放入数组datas里面去，依次循环存入进去
      if (cursor) {
        datas.push(cursor.value);
        cursor.continue();
      } else {
        // 否则的话，如果datas有数据的话，就支持调用回调函数
        if (datas.length > 0) {
          successCallback(datas);
        } else {
          // 如果datas数据为空，发送一个json请求
          axios.get("http://localhost:8081/public/json/index.json").then(datas => {
            var list = datas.data.data;
            // 打开数据仓库或表名，执行对应的事务操作
            openObjectStore("store", function(datasStore) {
              for (let i = 0; i < list.length; i++) {
                datasStore.add(list[i]);
              }
              successCallback(datas);
            }, "readwrite");
          });
        }
      }
    }
  });
  if (!db) {
    axios.get("http://localhost:8081/public/json/index.json", successCallback);
  }
};

var addToObjectStore = function(storeName, object) {
  openObjectStore(storeName, function(store) {
    store.add(object);
  }, "readwrite");
};

var updateInObjectStore = function(storeName, id, object) {
  openObjectStore(storeName, function(objectStore) {
    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (!cursor) {
        return;
      }
      if (cursor.value.id === id) {
        objectStore.put(object);
        return;
      }
      cursor.continue();
    }
  }, "readwrite");
}

window.addToObjectStore = addToObjectStore;
window.updateInObjectStore = updateInObjectStore;

window.getStore = getStore;
