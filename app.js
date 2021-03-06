'use strict';

var Koa = require('koa');
var sha1 = require('sha1');

var config = {
  wechat: {
    appId: 'wx8eb5b980e2cde7ba',
    appSecret: 'c63eacff58e5adffc1584c9d83bb0c39',
    token: 'yinhaixiang'
  }
};

var app = new Koa();

app.use(function *(next) {
  console.log(this.query);

  var token = config.wechat.token;
  var signature = this.query.signature;
  var nonce = this.query.nonce;
  var timestamp = this.query.timestamp;
  var echostr = this.query.echostr;
  var str = [token, timestamp, nonce].sort().join('');
  var sha = sha1(str);
  if(sha === signature) {
    this.body = echostr + '';
  } else {
    this.body = 'wrong';
  }
});

app.listen(1234);

console.log('listening: 1234');











