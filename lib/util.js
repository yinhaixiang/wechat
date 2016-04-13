'use strict';

var fs = require('fs');
var Promise = require('bluebird');

exports.readFileAsync = function(fpath) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fpath, 'utf-8', function(err, content) {
      if(err) return reject(err);
      resolve(content);
    });
  });
};


exports.writeFileAsync = function(fpath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fpath, content, function(err, content) {
      if(err) return reject(err);
      resolve(content);
    });
  });
};