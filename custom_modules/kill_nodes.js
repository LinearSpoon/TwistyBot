if (process.platform == 'win32')
{
	// Try to kill existing node processes
	console.warn('Killing old node processes...');
	var cp = require('child_process');
	// Search for the npm process
	var npmsearch = cp.execSync('wmic process WHERE "Name=' + "'node.exe' AND CommandLine LIKE '%npm%'" + '" GET ProcessId');
	var cmd; var re = /\d+/g; var r = re.exec(npmsearch);
	if (r == null)
	{
		console.log('Could not find npm process.');
		cmd = 'taskkill /F /FI "IMAGENAME eq node.exe" /FI "PID ne ' + process.pid + '"';
	}
	else
	{
		console.log('Excluding npm at process ' + r[0] + '.');
		cmd = 'taskkill /F /FI "IMAGENAME eq node.exe" /FI "PID ne ' + r[0] + '" /FI "PID ne ' + process.pid + '"';
	}
	// Kill node
	cp.exec(cmd, function(err, stdout, stderr) {
		//console.log('stdout: ', stdout)
		if (err)
		{
			console.error('There was an error killing the other node processes.');
			console.log('error: ', error);
			console.log('stdout: ', stdout);
			return process.exit(1);
		}
		// Read stdout for the killed process IDs
		var killed_nodes = ''; var first = true;
		do {
			r = re.exec(stdout);
			if (r)
			{
				killed_nodes += first ? r[0] : ', ' + r[0];
				first = false;
			}
		} while (r);
		console.log('Killed existing node processes at ' + killed_nodes + '.')
	});
}
