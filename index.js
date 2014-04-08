'use strict';

var _ = require('underscore');
var superagent = require('superagent');
var LRU = require('lru-cache');

function Chaps(opts){
  if(opts.cache) {
    opts.LRU = _.defaults(opts.LRU || {}, {
      max: 500,
      length: function () { return 1 },
      maxAge: 1000 * 60 * 60
    });
    this.cache = LRU(opts.LRU);
  }

  this.opts = opts;
  return this;
}

// build a key for get requests
Chaps.prototype.key = function(opts){
  var key = {};
  key.uri = opts.hostname + opts.url;
  function keyModifier(obj){
    if(obj) {
      var sortedObj = {};
      Object.keys(obj).sort().forEach(function(v) {
        sortedObj[v] = obj[v];
      });
      return sortedObj;
    }
  }
  ['headers', 'cookies', 'query'].forEach(function(modifier){
    if(opts[modifier]){
      key[modifier] = keyModifier(opts[modifier]);
    }
  });
  key = JSON.stringify(key);
  return key;
};

// build a superagent request handler
Chaps.prototype.req = function(opts){
  var sa = superagent[opts.method](opts.hostname + opts.url);

  // set headers
  for(var header in opts.headers) {
    sa.set(header, opts.headers[header]);
  }
  // set query params
  if(opts.query) {
    sa.query(opts.query);
  }
  // set timeout
  sa.timeout(opts.timeout || 2000);

  return sa;
};

// handle get requests
Chaps.prototype.get = function(opts, cb){
  opts = _.defaults(opts, this.opts);

  if(this.cache && opts.cache) {
    // attempt a cache hit
    var key = this.key(opts);
    var val = this.cache.get(key);
    if(val) {
      // return any cache hit in callback
      return cb(null, {
        cache: true,
        body: val
      });
    }
  }

  // build a superagent request object
  opts.method = 'get';
  var req = this.req(opts);

  // fetch data
  var self = this;
  req.end(function(err, res){
    // cache any good response
    if(!err && self.cache && opts.cache && res && res.status === 200 && res.body) {
      self.cache.set(key, res.body);
    }
    // return res in callback
    cb(err, res);
  });
};

// handle post requests
Chaps.prototype.post = function(opts, cb){
  opts = _.defaults(opts, this.opts);
  opts.method = 'post';
  var req = this.req(opts);
  req.send(opts.payload).end(cb);
};

module.exports = Chaps;
