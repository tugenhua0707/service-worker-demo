

import $ from 'jquery';

$(function() {
  openDataBase("store-data2", 2).then(function(db) {
    return openObjectStore(db, "store", "readwrite");
  }).then(function(objectStore) {
    return addToObjectStore("store", {id: 1, name: 'kongzhi111', age: 11});
  }).then(function() {
    console.log('添加成功');
  }).catch(function(error) {
    console.log("数据库加载失败", error);
  });
  /*
  var addStore = function(id, name, age) {
    var obj = {
      id: id,
      name: name,
      age: age
    };
    addToObjectStore("store", obj);
    renderHTMLFunc(obj);
    $.getJSON("http://localhost:8081/public/json/index.json", obj, function(data) {
      updateDisplay(data);
    });
  };
  $("#submit").click(function(e) {
    addStore(3, 'longen1', '111');
  });
  $("#update").click(function(e) {
    $.getJSON("http://localhost:8081/public/json/index.json", {id: 1}, function(data) {
      updateInObjectStore("store", 1, data);
      updateDisplay(data);
    });
  });
  */
});