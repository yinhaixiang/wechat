'use strict';

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
    }
    this.body = reply;
  }
  yield next;
};



