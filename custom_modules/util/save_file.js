var fs = require('fs');

// Returns a promise that resolves if the file is saved
module.exports = function(filename, text) {
	return new Promise(function(resolve, reject) {
		fs.writeFile(filename, text, err => err ? reject(err) : resolve() );
	});
};
