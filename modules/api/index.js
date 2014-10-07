var argv = require('minimist')(process.argv.slice(2));
var port = argv.p || 3000;
var http = require('http');
var fs = require('fs');
var path = require('path');
var server;

server = http.createServer(function (req, res) {
	var url = req.url;

	if (url === '/api/knock') {
		console.log('Knock knock Neo');
		res.write('Knock knock Neo');
		res.end();
	} else {
		res.write('Unsupported request');
		res.end();
	}
});

server.on('listening', function () {
	console.log('listening on port ' + port);
});

server.on('error', function (e) {
	console.error('Error: ' + e.message);
});

server.listen(port);
