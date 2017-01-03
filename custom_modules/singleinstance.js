var ipc = require('node-ipc');

var app_id = __filename.replace(/\/|\.js/g, ''); // Needs to be the same every run but unique to this project
ipc.config.id = app_id;
ipc.config.silent = true;
ipc.config.maxRetries = 0;


// on_start and on_stop should return promises that resolve when their work is complete
module.exports = function(on_start, on_stop) {
	// Server doesn't start until ip.server.start is called
	ipc.serve(function() {
		ipc.server.on('kill', function(data,socket) {
			console.log('Received kill message. Stopping...');
			on_stop()
				.then(function() {
					ipc.server.emit(socket, 'going_away');
					ipc.server.stop();
					console.log('Stopped process.');
					process.exit();
				})
				.catch(function(err) {
					console.log('Stopped process with error', err);
					process.exit();
				});
		});
	});

	ipc.connectTo(app_id, function() {
		ipc.of[app_id].on('connect', function() {
			console.log('Found previous instance of server.');
			// Send kill event and wait for going_away
			ipc.of[app_id].emit('kill');
		});

		ipc.of[app_id].on('error', function(err) {
			console.log('Could not find another instance of server.');
			ipc.server.start();
			on_start();
		});

		ipc.of[app_id].on('going_away', function(data) {
			console.log('Previous server has shutdown. Starting server...');
			ipc.server.start();
			on_start();
		});
	});
};
