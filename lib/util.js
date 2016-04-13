'use strict';

var fs = require('fs');
var Promise = require('bluebird');
var xml2js = require('xml2js');

exports.parseXMLAsync = function(xml) {
  return new Promise(function(resolve, reject) {
    xml2js.parseString(xml, {trim: true}, function(err, content) {
      if(err) return reject(err);
      return resolve(content);
    });
  });
};

function formatMessage(result) {
  var message = {};
  if(typeof result === 'object') {
    var keys = Object.keys(result);
    for(var i=0; i<keys.length; i++) {
      var item = result[keys[i]];
      var key = keys[i];
      if(!(item instanceof Array) || item.length === 0) {
        continue;
      }
      if(item.length === 1) {
        var val = item[0];
        if(typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          message[key] = (val || '').trim();
        }
      } else {
        message[key] = [];
        for(var j=0, k=item.length; i<k; i++) {
          message[key].push(formatMessage(item[j]))
        }
      }
    }
  }

  return message;
}

exports.formatMessage = formatMessage;


exports.readFileAsync = function(fpath) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fpath, 'utf-8', function(err, content) {
      if(err) return reject(err);
      return resolve(content);
    });
  });
};


exports.writeFileAsync = function(fpath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fpath, content, function(err, content) {
      if(err) return reject(err);
      return resolve(content);
    });
  });
};