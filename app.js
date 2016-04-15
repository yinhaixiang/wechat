'use strict';

var Koa = require('koa');
var sha1 = require('sha1');
var g = require('./wechat/g');
var weixin = require('./wechat/weixin');
var config = require('./wechat/config');

var app = new Koa();


app.use(g(config.wechat, weixin.reply));

app.listen(1234);

console.log('listening: 1234');











