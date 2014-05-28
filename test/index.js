/*eslint handle-callback-err:0 */
'use strict';

var server = require('./server');
var test = require('tape');
var Chaps = require('..');

var tests = 3;
var testsComplete = 0;

function finishTest() {
  if (++testsComplete >= tests) {
    server.stop();
  }
}

function runTests() {
  test('should make a request', function(t) {
    t.plan(1);

    var chaps = new Chaps({
      debug: true,
      hostname: 'localhost',
      timeout: 2000
    });

    chaps.get({
      url: ':9615/a'
    }, function(err, data) {
      t.equal(data.body.count, 1);
      finishTest();
    });

  });

  test('should cache a request result', function(t) {
    t.plan(3);

    var chaps = new Chaps({
      debug: true,
      hostname: 'localhost',
      timeout: 2000,
      LRU: {
        maxAge: 500
      }
    });

    chaps.get({
      url: ':9615/b'
    }, function(err, data) {
      t.equal(data.body.count, 1);

      chaps.get({
        url: ':9615/b'
      }, function(err, data) {
        t.equal(data.body.count, 1);

        setTimeout(function() {
          chaps.get({
            url: ':9615/b'
          }, function(err, data) {
            t.equal(data.body.count, 2);
            finishTest();
          });
        }, 600);
      });
    });
  });

  test('should support excluding elements from the cache key', function(t) {
    t.plan(2);

    var chaps = new Chaps({
      debug: true,
      hostname: 'localhost',
      timeout: 2000,
      cacheKeyExcludes: ['query']
    });

    chaps.get({
      url: ':9615/c'
    }, function(err, data) {
      t.equal(data.body.count, 1);
      chaps.get({
        url: ':9615/c',
        query: {
          reset: true
        }
      }, function(err, data) {
        t.equal(data.body.count, 1);
        finishTest();
      });
    });
  });

}

server.start(runTests);
