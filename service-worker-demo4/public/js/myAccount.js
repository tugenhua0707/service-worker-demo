

import $ from 'jquery';

$(function() {
  // 请求数据并且渲染数据
  requestAndRenderFunc();


  // 向服务器请求数据，并且渲染页面
  function requestAndRenderFunc () {
    getStore(renderHTMLFunc);
  };

  function renderHTMLFunc(datas) {
    console.log(datas);
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
});