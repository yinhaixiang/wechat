'use strict';

var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Promise = require('bluebird');
var fs = require('fs');
var request = Promise.promisify(require('request'));
var util = require('../lib/util');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';

var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  upload: prefix + 'media/upload?'
};

function Wechat(opts) {
  var self = this;
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;

  this.fetchAccessToken();

}

Wechat.prototype.fetchAccessToken = function () {
  var self = this;
  if (self.access_token && self.expires_in) {
    if (self.isValidAccessToken(self)) {
      return Promise.resolve(self);
    }
  }
  self.getAccessToken()
    .then(function (data) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return self.updateAccessToken();
      }

      if (self.isValidAccessToken(data)) {
        return Promise.resolve(data);
      } else {
        return self.updateAccessToken();
      }
    })
    .then(function (data) {
      self.access_token = data.access_token;
      self.expires_in = data.expires_in;
      self.saveAccessToken(data);
      return Promise.resolve(data);
    });
};

Wechat.prototype.isValidAccessToken = function (data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false;
  }

  var access_token = data.access_token;
  var expires_in = data.expires_in;
  var now = new Date().getTime();

  if (now < expires_in) {
    return true;
  } else {
    false;
  }
};

Wechat.prototype.updateAccessToken = function () {
  var appID = this.appID;
  var appSecret = this.appSecret;
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

  return new Promise(function (resolve, reject) {
    request({url: url, json: true})
      .then(function (res) {
        var data = res.body;
        var now = new Date().getTime();
        var expires_in = now + (data.expires_in - 20) * 1000;
        data.expires_in = expires_in;
        resolve(data);
      });
  });
};

Wechat.prototype.uploadMaterial = function (type, fpath) {
  var self = this;
  var form = {
    media: fs.createReadStream(fpath)
  };

  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.upload + 'access_token=' + data.access_token + '&type=' + type;
        request({method: 'POST', url: url, formData: form, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('upload material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });

      });
  });
};

Wechat.prototype.reply = function () {
  var content = this.body;
  var message = this.weixinMessage;
  var xml = util.tpl(content, message);
  this.status = 200;
  this.type = 'application/xml';
  this.body = xml;
};


module.exports = Wechat;








