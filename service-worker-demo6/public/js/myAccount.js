

import $ from 'jquery';

$(function() {
  function renderHTMLFunc(obj) {
    console.log('渲染html元素')
    console.log(obj);
  }
  function updateDisplay(d) {
    console.log(d);
  };
  var addStore = function(id, name, age) {
    var obj = {
      id: id,
      name: name,
      age: age
    };
    addToObjectStore("store", obj);
    renderHTMLFunc(obj);
    // 先判断浏览器支付支持sync事件
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then(function(registration) {
        registration.sync.register("sync-store").then(function() {
          console.log("后台同步已触发");
        }).catch(function(err){
          console.log('后台同步触发失败', err);
        })
      });
    } else {
      $.getJSON("http://localhost:8081/public/json/index.json", obj, function(data) {
        updateDisplay(data);
      });
    }
  };
  $("#submit").click(function(e) {
    addStore(1, 'kongzhi111', '28');
  });
  /*
  $("#update").click(function(e) {
    $.getJSON("http://localhost:8081/public/json/index.json", {id: 1}, function(data) {
      updateInObjectStore("store", 1, data);
      updateDisplay(data);
    });
  });
  */
});