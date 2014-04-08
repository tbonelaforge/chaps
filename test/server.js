'use strict';

var http = require('http');
var counts = {
  '/a': 0,
  '/b': 0
};
var server;
var port = 9615;

exports.start = function start(cb) {
  server = http.createServer(function (req, res) {
    if(req.url === '/favicon.ico'){
      return res.end();
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({"count":++counts[req.url]}));
  }).listen(port, function(){
    console.log('test server started on port', port);
    cb();
  });
};

exports.stop = function stop() {
  server.close(function(){
    console.log('test server stopped');
  });
};
