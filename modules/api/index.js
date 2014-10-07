var axios = require('axios');
var argv = require('minimist')(process.argv.slice(2));
var port = argv.p || 3000;
var http = require('http');
var fs = require('fs');
var path = require('path');
var server;
var LIFX_HOST = 'http://192.168.1.223:56780';
var LIFX_ID = 'd073d5018475';

function toggleBrightness(color, count) {
	console.log('toggle brightness', count);
	axios.put(LIFX_HOST + '/lights/' + LIFX_ID + '/color', {
		hue: color.hue,
		saturation: color.saturation,
		brightness: (count) % 2,
		duration: .01
	})
	.then(function () {
		if (count < 5) {
			toggleBrightness(color, count + 1);
		}
	});
}

server = http.createServer(function (req, res) {
	var url = req.url;

	if (url === '/api/knock') {
		console.log('Knock knock Neo');
		res.write('Knock knock Neo');
		res.end();
	} else if (url === '/api/lifx') {
		axios.get(LIFX_HOST + '/lights/' + LIFX_ID)
			.then(function (res) {
				toggleBrightness(res.data.color, 0);
			});

		console.log('Ooh, pretty');
		res.write('Ooh, pretty');
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
