var fs = require('fs');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

//var access_token = fs.readFileSync('../config.wechat.txt');
var configStr = fs.readFileSync('/Users/sean/webstormProjects/wechat/config/wechat.txt', 'utf-8');
var configObj = JSON.parse(configStr);
var access_token = configObj.access_token;

var url = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=' + access_token;
var body = '{"user_list":[{"openid":"oMv6cweWIYj66otCbmKvG8OV6Ejs"}]}';

request({method: 'POST', url: url, body: JSON.parse(body), json: true})
  .then(function(res) {
    console.log(res.body);
  });