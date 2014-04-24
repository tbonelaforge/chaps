'use strict';

var _ = require('lodash');
var superagent = require('superagent');
var LRU = require('lru-cache');
var deepval = require('deepval');

function Chaps(opts){
  if(opts.cache || opts.LRU) {
    opts.cache = true;
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
      // deep clone objects to allow any cacheKeyExcludes to be deleted
      key[modifier] = _.clone(keyModifier(opts[modifier]), true);
    }
  });

  // remove any key values that should be excluded
  if(opts.cacheKeyExcludes){
    opts.cacheKeyExcludes.forEach(function(exclude){
      deepval(key, exclude, null, true);
    });
  }

  key = JSON.stringify(key);
  return key;
};

// build a superagent request handler
Chaps.prototype.req = function(opts){
  var sa = superagent[opts.method](opts.hostname + opts.url);

  // JSON.stringify requested options
  if(opts.stringifies){
    opts.stringifies.forEach(function(stringify){
      stringify = deepval(opts, stringify, JSON.stringify(deepval(opts, stringify)));
    });
  }

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
      if(opts.debug){
        console.log('cache hit:', key);
      }
      return cb(null, {
        cache: true,
        body: val
      });
    } else if (opts.debug) {
      console.log('cache miss:', key);
    }
  } else if (opts.debug) {
    console.log('cache skip:', this.key(opts));
  }

  // build a superagent request object
  opts.method = 'get';
  var req = this.req(opts);

  // fetch data
  var self = this;
  // console.log(req);
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
