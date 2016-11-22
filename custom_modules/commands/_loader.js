var fs = require('fs');

// Load all files in current directory
var files = fs.readdirSync(__dirname)
for(var i = 0; i < files.length; i++)
{
	var filename = files[i];
	if (filename == 'index.js')
		continue; // Don't load this file
	var file_no_ext = filename.replace(/\.[^\.]*/,'');
	// Dynamically load and export a file
	module.exports[file_no_ext] = require(__dirname + '/' + filename);
}
