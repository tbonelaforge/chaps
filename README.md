# Chaps [![](https://travis-ci.org/creativelive/chaps.png)](https://travis-ci.org/creativelive/chaps)

[LRU cache](https://github.com/isaacs/node-lru-cache) fronted [superagent](https://github.com/visionmedia/superagent)

## Usage

```
var chaps = new Chaps({
  hostname: 'localhost',
  timeout: 2000,
  cache: true,
  LRU: {
    max: 100,
    maxAge: 500
  }
});

chaps.get({
  url: '/foo'
}, function(err, res){

});

```
