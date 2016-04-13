'use strict';
var sha1 = require('sha1');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

var prefix = 'https://api.weixin.qq.com/cgi-bin/';

var api = {
  accessToken:  prefix + 'token?grant_type=client_credential'
};

function Wechat(opts) {
  var self = this;
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;

  this.getAccessToken()
    .then(function(data) {
      try {
        data = JSON.parse(data);
      } catch(e) {
        return self.updateAccessToken();
      }

      if(self.isValidAccessToken(data)) {
        return Promise.resolve(data);
      } else {
        return self.updateAccessToken();
      }
    })
    .then(function(data) {
      self.access_token = data.access_token;
      self.expires_in = data.expires_in;
      self.saveAccessToken(data);
    });
}

Wechat.prototype.isValidAccessToken = function(data) {
  if(!data || !data.access_token || !data.expires_in) {
    return false;
  }

  var access_token = data.access_token;
  var expires_in = data.expires_in;
  var now = new Date().getTime();

  if(now < expires_in) {
    return true;
  } else {
    false;
  }
};

Wechat.prototype.updateAccessToken = function() {
  var appID = this.appID;
  var appSecret = this.appSecret;
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

  return new Promise(function(resolve, reject) {
    request({url: url, json: true})
      .then(function(res, body) {
        var data = res.body;
        var now = new Date().getTime();
        var expires_in = now + (data.expires_in - 20) * 1000;
        data.expires_in = expires_in;
        resolve(data);
      });
  });
};



module.exports = function(opts) {
  var wechat = new Wechat(opts);

  return function *(next) {
    console.log(this.query);
    var token = opts.token;
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
  }
};









