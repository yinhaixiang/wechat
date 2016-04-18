'use strict';

var config = require('./config');
var Wechat = require('./wechat');
var wechatApi = new Wechat(config.wechat);

exports.reply = function *(next) {
  var message = this.weixinMessage;

  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      console.log('扫二维码进来:');
      this.body = '你好';
    } else if (message.Event === 'unsubscribe') {
      console.log('取消关注');
      this.body = '';
    } else if (message.Event === 'LOCATION') {
      this.body = '您上报的位置是:' + message.Latitude + '/' + message.Longitude + '-' + message.Precision;
    } else if (message.Event === 'CLICK') {
      this.body = '您点击了菜单:' + message.Eventkey;
    } else if (message.Event === 'SCAN') {
      console.log('关注后扫二维码:' + message.EventKey + ' ' + message.Ticket);
      this.body = '看到你扫了一下';
    } else if (message.Event === 'VIEW') {
      this.body = '您点击了菜单中得链接:' + message.Eventkey;
    }
  } else if (message.MsgType === 'text') {
    var content = message.Content;
    var reply = '你说的 ' + message.Content + ' 太复杂了';
    if (content === '1') {
      reply = '11111';
    } else if (content === '2') {
      reply = '22222';
    } else if (content === '3') {
      reply = '33333'
    } else if(content === '4') {
      reply = [{
        title: '技术改变世界',
        description: '只是个描述而已',
        picUrl: 'http://www.admin10000.com/UploadFiles/Document/201404/08/20140408151441270362.JPG',
        url: 'https://www.baidu.com/'
      }];
    } else if(content === '5') {
      var data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg');
      reply = {
        msgType: 'image',
        mediaId: data.media_id
      };
    } else if(content === '6') {
      var data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg');
      reply = {
        msgType: 'music',
        title: '回复音乐内容',
        description: '放松一下',
        musicUrl: 'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3',
        thumbMediaId: data.media_id
      }
    }
    this.body = reply;
  }
  yield next;
};



