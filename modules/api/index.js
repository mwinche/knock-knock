var argv = require('minimist')(process.argv.slice(2));
var port = argv.p || 3000;
var http = require('http');
var lifx = require('lifx');

var COLORS = {
	1: 0xf378,
	6: 0xaaaa
};

var server, ourBulb;
lx = lifx.init();

function lazyLoadBulb() {
	if (!ourBulb) {
		lx.bulbs.forEach(function (bulb) {
console.log('bulb.name', bulb.name);
			if (bulb.name === 'AtTask') {
				ourBulb = bulb;
			}
		});

		lx.stopDiscovery();

		lx.lightsColour(0, 0xffff, 0, 0x0dac, 0x0032, ourBulb);
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

		lx.lightsColour(color, 0xffff,     0xffff,    0x0dac,      0x1f4,   ourBulb);

		setTimeout(function(){
			lx.lightsColour(color, 0xffff,     0x6666,    0x0dac,      0x1f4,   ourBulb);
		}, 500);


		setTimeout(function(){
			lx.lightsColour(originalColors.hue, originalColors.saturation, originalColors.brightness, 0x0dac, 0x02f1, ourBulb);

			knocking = false;
console.log('timing', timings);
console.log('============NOT KNOCKING==============');
		}, 2000);
	}
}

server = http.createServer(function (req, res) {
	var url = req.url,
		resp = 'Cannot find bulb';

	if (url === '/api/newBulb'){
		ourBulb = undefined;
		res.write('done');
		res.end();
	}
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
				if(!knocking){
					knock(timings, {
						hue: 0,
						brightness: 0,
						saturation: 0xffff
					});
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
