'use strict';

var http = require('http');
var counts = {};
var server;
var port = 9615;

exports.start = function start(cb) {
  server = http.createServer(function(req, res) {
    if (req.url === '/favicon.ico') {
      return res.end();
    }
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });

    // figure out which count is being requested
    var element = req.url.substring(1, 2);
    counts[element] = counts[element] || 0;

    // increment the count
    counts[element]++;

    // basic query string extractor
    var qs = req.url.split('?')[1];
    if (qs) {
      var query = {};
      qs = qs.split('&');
      qs.forEach(function(q) {
        q = q.split('=');
        query[q[0]] = q[1];
      });
      if (query && query.reset) {
        counts[element] = 0;
      }
    }

    // send response
    res.end(JSON.stringify({
      'count': counts[element]
    }));
  }).listen(port, function() {
    console.log('test server started on port', port);
    cb();
  });
};

exports.stop = function stop() {
  console.log('stopping test server...');
  server.close(function() {
    console.log('test server stopped');
  });
};
