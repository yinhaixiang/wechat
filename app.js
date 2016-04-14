'use strict';

var Koa = require('koa');
var sha1 = require('sha1');
var wechat = require('./wechat');
var weixin = require('./weixin');
var config = require('./config');

var app = new Koa();

app.use(wechat(config.wechat, weixin.reply));

app.listen(1234);

console.log('listening: 1234');











