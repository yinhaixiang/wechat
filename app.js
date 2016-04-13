'use strict';

var Koa = require('koa');
var sha1 = require('sha1');
var wechat = require('./wechat');
var util = require('./lib/util');
var wechat_file = './config/wechat.txt';

var config = {
  wechat: {
    appID: 'wx8eb5b980e2cde7ba',
    appSecret: 'c63eacff58e5adffc1584c9d83bb0c39',
    token: 'yinhaixiang',
    getAccessToken: function(data) {
      return util.readFileAsync(wechat_file);
    },
    saveAccessToken: function(data) {
      data = JSON.stringify(data);
      return util.writeFileAsync(wechat_file, data);
    }
  }
};

var app = new Koa();

app.use(wechat(config.wechat));

app.listen(1234);

console.log('listening: 1234');











