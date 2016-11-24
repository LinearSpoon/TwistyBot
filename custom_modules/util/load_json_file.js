var fs = require('fs');

module.exports = function(filepath, default_if_error)
{
	default_if_error = typeof default_if_error == 'undefined' ? {} : default_if_error;
	return new Promise(function(resolve, reject) {
		fs.readFile(filepath, 'utf8', function(err, data) {
			if (err)
				return resolve({});
			try {
				return resolve(JSON.parse(data));
			} catch(e) {
				return resolve({});
			}
		});
	});
}
