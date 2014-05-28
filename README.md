# Chaps [![](https://travis-ci.org/creativelive/chaps.png)](https://travis-ci.org/creativelive/chaps)

[LRU cache](https://github.com/isaacs/node-lru-cache) fronted [superagent](https://github.com/visionmedia/superagent)

## Usage

```
var chaps = new Chaps({
  hostname: 'localhost',
  timeout: 2000,
  cache: true,
  LRU: { // implies cache: true
    // options passed to LRU object, see LRU lib for more options
    // default LRU values chaps provides
    length: function () { return 1; },
    max: 100,
    maxAge: 60000  // cache for 1 minute
  },
  cacheKeyExcludes: ['query.foo', 'query.bar.aaa'], // sting dot notation of object values to not impact caching routes
  stringify: ['query.foo'] // string dot notation of object values to JSON.stringify before sending request
});

chaps.get({
  url: '/foo'  // url to hit
}, function(err, res){

});

```
