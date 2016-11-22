var request = require('request');

// Download the page or die
module.exports = function(url) {
	return new Promise(function(resolve, reject) {
		request(url, function(err, res, body) {
			if (err)
				return reject(err);
			if (res.statusCode != 200)
				return reject(Error('Bad request (' + res.statusCode + ': ' + res.statusMessage + ')'));
			return resolve(body);
		});
	});
};
