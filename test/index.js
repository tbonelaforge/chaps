'use strict';

var server = require('./server');
var test = require('tape');
var Chaps = require('..');

var tests = 2;
var testsComplete = 0;
function finishTest() {
  if(++testsComplete >= tests) {
    server.stop();
  }
}

function runTests() {
  test('should make a request', function (t) {
    t.plan(1);

    var chaps = new Chaps({
      debug: true,
      hostname: 'localhost',
      timeout: 2000,
      cache: true,
      LRU: {
        max: 100,
        maxAge: 500
      }
    });

    chaps.get({
      url: ':9615/a'
    }, function(err, data){
      t.equal(data.body.count, 1);
      finishTest();
    });

  });

  test('should cache a request result', function (t) {
    t.plan(3);

    var chaps = new Chaps({
      debug: true,
      hostname: 'localhost',
      timeout: 2000,
      cache: true,
      LRU: {
        max: 100,
        maxAge: 500
      }
    });

    chaps.get({
      url: ':9615/b'
    }, function(err, data){
      t.equal(data.body.count, 1);

      chaps.get({
        url: ':9615/b'
      }, function(err, data){
        t.equal(data.body.count, 1);

        setTimeout(function(){
          chaps.get({
            url: ':9615/b'
          }, function(err, data){
            t.equal(data.body.count, 2);
            finishTest();
          });
        }, 600);
      });
    });
  });

}

server.start(runTests);
