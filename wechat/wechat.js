'use strict';

var _ = require('lodash');
var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Promise = require('bluebird');
var fs = require('fs');
var request = Promise.promisify(require('request'));
var util = require('../lib/util');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';

var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload: prefix + 'media/upload?',
    fetch: prefix + 'media/get?'
  },
  permanent: {
    upload: prefix + 'material/add_material?',
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploading?',
    fetch: prefix + 'material/get_material?',
    del: prefix + 'material/del_material?',
    count: prefix + 'material/get_materialcount?',
    batch: prefix + 'material/batchget_material?'
  },
  group: {
    create: prefix + 'groups/create?',
    fetch: prefix + 'groups/get?',
    check: prefix + 'groups/getid?',
    update: prefix + 'groups/update?',
    move: prefix + 'groups/members/update?',
    batchMove: prefix + 'groups/members/batchupdate?',
    del: prefix + 'groups/delete?'
  },
  user: {
    remark: prefix + 'user/info/updateremark?',
    fetch: prefix + 'user/info?',
    batchFetch: prefix + 'user/info/batchget?'
  }
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

Wechat.prototype.uploadMaterial = function (type, material, permanent) {
  var self = this;
  var form = {};
  var uploadUrl = api.temporary.upload;

  if (permanent) {
    uploadUrl = api.permanent.upload;
    _.extend(form, permanent);
  }

  if (type === 'pic') {
    uploadUrl = api.permanent.uploadNewsPic;
  }

  if (type === 'news') {
    uploadUrl = api.permanent.uploadNews;
    form = material;
  } else {
    form.media = fs.createReadStream(material);
  }

  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = uploadUrl + 'access_token=' + data.access_token;

        if (!permanent) {
          url += '&type=' + type;
        } else {
          form.access_token = data.access_token;
        }

        var options = {
          method: 'POST',
          url: url,
          json: true
        };

        if (type === 'news') {
          options.body = form;
        } else {
          options.formData = form;
        }

        request(options)
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

Wechat.prototype.fetchMaterial = function (mediaId, type, permanent) {
  var self = this;
  var fetchUrl = api.temporary.fetch;
  if (permanent) {
    fetchUrl = api.permanent.fetch;
  }
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = fetchUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId;
        var form = {};
        var options = {method: 'POST', url: url, json: true};
        if (permanent) {
          form.media_id = mediaId;
          form.access_token = data.access_token;
          options.body = form
        } else {
          url += '&media_id=' + mediaId;
        }

        if (type === 'news' || type === 'videl') {
          request(options)
            .then(function (res) {
              var _data = res.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('delete material fails');
              }
            })
            .catch(function (err) {
              reject(err);
            });
        } else {
          resolve(url);
        }


      });
  });
};

Wechat.prototype.deleteMaterial = function (mediaId) {
  var self = this;
  var form = {
    media_id: mediaId
  };
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;

        request({method: 'POST', url: url, body: form, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('delete material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.countMaterial = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.permanent.count + 'access_token=' + data.access_token;
        request({method: 'GET', url: url, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('count material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.batchMaterial = function (options) {
  var self = this;
  options.type = options.type || 'image';
  options.offset = options.offset || 0;
  options.count = options.type || 1;


  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.permanent.batch + 'access_token=' + data.access_token;
        console.log(url);
        request({method: 'POST', url: url, body: options, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batch material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.createGroup = function (name) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.group.create + 'access_token=' + data.access_token;
        var options = {
          group: {
            name: name
          }
        };
        request({method: 'POST', url: url, body: options, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batch material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.fetchGroups = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.group.fetch + 'access_token=' + data.access_token;
        request({method: 'GET', url: url, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batch material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.checkGroup = function (openid) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.group.check + 'access_token=' + data.access_token;
        var options = {
          openid: openid
        };
        request({method: 'POST', url: url, body: options, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batch material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.updateGroup = function (id, name) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.group.update + 'access_token=' + data.access_token;
        var options = {
          group: {
            id: id,
            name: name
          }
        };
        request({method: 'POST', url: url, body: options, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batch material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.batchMoveGroup = function (openids, to_groupid) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url;
        var options = {
          to_groupid: to_groupid
        };

        if (_.isArray(openids)) {
          url = api.group.batchMove + 'access_token=' + data.access_token;
          options.openid_list = openids;
        } else {
          url = api.group.move + 'access_token=' + data.access_token;
          options.openid = openids;
        }

        request({method: 'POST', url: url, body: options, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batch material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.deleteGroup = function (id) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.group.del + 'access_token=' + data.access_token;
        var options = {
          group: {
            id: id
          }
        };
        request({method: 'POST', url: url, body: options, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batch material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.remarkUser = function (openid, remark) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var url = api.user.remark + 'access_token=' + data.access_token;
        var options = {
          openid: openid,
          remark: remark
        };
        request({method: 'POST', url: url, body: options, json: true})
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batch material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

Wechat.prototype.fetchUsers  = function (openids, lang) {
  var self = this;
  lang = lang || 'zh_CN';
  return new Promise(function (resolve, reject) {
    self.fetchAccessToken()
      .then(function (data) {
        var options = {
          json: true
        };
        if(_.isArray(openids)) {
          options.url = api.user.batchFetch + 'access_token=' + data.access_token;
          options.body = {
            user_list: openids
          };
          options.method = 'POST';
        } else {
          options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openids + '&lang=' + lang;
        }
        console.log(options);
        request(options)
          .then(function (res) {
            var _data = res.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('batch material fails');
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








