'use strict';

var fs = require('fs');
var path = require('path');
var koa = require('koa');
var xss = require('xss');

var app = koa();

var count = function (filePath) {
  if (!filePath) {
    throw new Error('缺少统计文件路径');
  }
  var num = 0;
  try {
    //fs.accessSync(filePath, fs.F_OK);
    num = parseInt(fs.readFileAsync(filePath));
  } catch (e) {
    console.log(filePath, num);
    fs.writeFileSync(filePath, -1);
  }

  if (isNaN(num)) {
    num = 0;
  }

  return function *count(next) {
    console.log(this.url);
    if (this.method === 'GET' && this.url.indexOf('/favicon.ico') === -1) {
      num++;
      fs.writeFileSync(filePath, num);
    }
    this.count = num;
    yield* next;
  }
};

app.use(count('./count.txt'));

app.use(function *() {
  var echo = this.query.echo;
  var snippet1 = '<!DOCTYPE html><html><head><title>回声机</title></head><body><span style="color:#ff6600; border:1px solid #ddd;">';
  var snippet2 = '</span></body></html>';
  var snippet3 = ' 回声次数：' + this.count;

  if (!echo) {
    this.body = snippet1 + '哔哔哔！我听不到你！' + snippet3 + snippet2
  }
  else {
    echo = xss(echo)
    this.body = snippet1 + echo + snippet3 + snippet2
  }
});


app.listen(3000)
console.log('成功启动服务，端口是 3000')









