# Chaps [![](https://travis-ci.org/creativelive/chaps.png)](https://travis-ci.org/creativelive/chaps)

[LRU cache](https://github.com/isaacs/node-lru-cache) fronted [superagent](https://github.com/visionmedia/superagent)

## Usage

```
var chaps = new Chaps({
  hostname: 'localhost',
  timeout: 2000,
  cache: true,
  LRU: { // options passed to LRU object
    max: 100,
    maxAge: 500 // ms
  }
});

chaps.get({
  url: '/foo'
}, function(err, res){

});

```
