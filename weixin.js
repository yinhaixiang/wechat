'use strict';

exports.reply = function *(next) {
  var message = this.weixinMessage;

  if(message.MsgType === 'event') {
    if(message.Event === 'subscribe') {
      console.log('扫二维码进来:');
      this.body = '你好';
    } else if(message.Event === 'unsubscribe') {
      console.log('取消关注');
      this.body = '';
    }
  } else {

  }
  yield next;
};



