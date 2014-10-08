var argv = require('minimist')(process.argv.slice(2));
var port = argv.p || 3000;
var http = require('http');
var lifx = require('lifx');

var COLORS = {
	1: 0xf378,
	6: 0x09d7
};

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
console.log('bulb.name', bulb.name);
			if (bulb.name === 'AtTask') {
				ourBulb = bulb;
			}
		});

		lx.stopDiscovery();
	}
}

var knocking = false;
console.log('============NOT KNOCKING==============');

function knock(timings, originalColors){
console.log('knock', timings, originalColors);
	var max = 0, lastTiming;

	if(knocking){ return; }
console.log('============KNOCKING==============');
	knocking = true;

	lazyLoadBulb();


	if(timings && timings.length > 0){
		var color = COLORS[timings.length] || 0xd49e;

		timings.forEach(function(timing){
			max = max > timing ? max : timing;

			setTimeout(function(){
				lx.lightsColour(color, 0xffff,     0x6666,    0x0dac,      0x0032,   ourBulb);
			}, timing);

			setTimeout(function(){
				lx.lightsColour(color, 0xffff,     0xffff,    0x0dac,      0x0032,   ourBulb);
			}, timing + 50);

			setTimeout(function(){
				lx.lightsColour(color, 0xffff,     0x6666,    0x0dac,      0x0032,   ourBulb);
			}, timing + 100);
		});


		setTimeout(function(){
			lx.lightsColour(originalColors.hue, originalColors.saturation, originalColors.brightness, 0x0dac, 0x02f1, ourBulb);

			knocking = false;
console.log('timing', timings);
console.log('============NOT KNOCKING==============');
		}, max + 1000);
	}
}

server = http.createServer(function (req, res) {
	var url = req.url,
		resp = 'Cannot find bulb';

	if (url === '/api/knock') {
		req.on('data', function(data, err){
			console.log('getting data');
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

			console.log('Number of knocks: ', timings.length);

			if(ourBulb){
				if(!nextKnock && !knocking){
					nextKnock = function(colors){
						knock(timings, colors);
					};
					lx.requestStatus();
					resp = 'Knock sent';
				}
				else{
					resp = 'Already knocking';
				}
			}

			console.log('got data', resp);

			res.write(resp);
			res.end();
		});
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
