let fs = require('fs');

// Synchronously walks through each file in a directory
module.exports = function(directory, callback) {
	let files = fs.readdirSync(directory);
	for(let i = 0; i < files.length; i++)
	{
		let path = directory + '/' + files[i];
		let stats = fs.statSync(path);
		callback({
			name: files[i],
			name_no_ext: files[i].replace(/\.[^.]*/, ''),
			path: path,
			stats: stats,
			is_file: stats.isFile(),
			is_directory: stats.isDirectory()
		});
	}
};