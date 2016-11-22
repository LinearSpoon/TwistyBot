var fs = require('fs');

// Returns a promise that resolves with the content of the file
module.exports = function(filename) {
	return new Promise(function(resolve, reject) {
		fs.readFile(filename, 'utf8', (err, data) => err ? reject(err) : resolve(data) );
	});
};
