var argv = require('minimist')(process.argv.slice(2));
var port = argv.p || 3000;
var http = require('http');
var lifx = require('lifx');

var server, nextKnock, ourBulb;
lx = lifx.init();

lx.on('rawpacket', function(pkt, b) {
	if(pkt.packetTypeShortName === 'lightStatus' && pkt.payload.bulbLabel === 'AtTask'){
		if(typeof nextKnock === 'function'){
			nextKnock(pkt.payload);
			nextKnock = undefined;
		}
	}
});

function lazyLoadBulb() {
	if (!ourBulb) {
		lx.bulbs.forEach(function (bulb) {
			if (bulb.name === 'AtTask') {
				ourBulb = bulb;
			}
		});

		lx.stopDiscovery();
	}
}

var knocking = false;

function knock(timings, originalColors){
	var max = 0;

	if(knocking){ return; }
	knocking = true;

	lazyLoadBulb();

	if(timings && timings.length > 0){
		timings.forEach(function(timing){
			setTimeout(function(){
				lx.lightsColour(0xd49e, 0xffff,     0x8888,    0x0dac,      0x0032,   ourBulb);
			}, timing);

			setTimeout(function(){
				lx.lightsColour(0xd49e, 0xffff,     0xffff,    0x0dac,      0x0032,   ourBulb);
			}, timing + 50);

			setTimeout(function(){
				lx.lightsColour(0xd49e, 0xffff,     0x8888,    0x0dac,      0x0032,   ourBulb);
			}, timing + 100);

			max = max > timing ? max : timing;
		});

		setTimeout(function(){
			lx.lightsColour(originalColors.hue, originalColors.saturation, originalColors.brightness, 0x0dac, 0x02f1, ourBulb);

			knocking = false;
		}, max + 1000);
	}
}

server = http.createServer(function (req, res) {
	var url = req.url;

	if (url === '/api/knock') {
		req.on('data', function(data, err){
			var message = data.toString('utf8'),
				timings;

			try{
				timings = JSON.parse(message);
			}
			catch(e){
				res.code = 400;
				res.write('Error: ' + e);

				return;
			}

			lazyLoadBulb();

			if(ourBulb){
				nextKnock = function(colors){
					knock(timings, colors);
				};
			}
		});

		res.write(JSON.stringify(ourBulb? 'Request sent': 'Cannot find bulb'));
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
