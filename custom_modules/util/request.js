var request = require('request');

// Useful variables
// res.body => string response from server
// res.statusCode => HTML status code
// res.statusMessage => string status code meaning
// Note:  This will not throw if the page is not found, make sure to check to check res.statusCode == 200
module.exports = function(url) {
	return new Promise(function(resolve, reject) {
		request(url, function(err, res, body) {
			return err ? reject(err) : resolve(res);
		});
	});
};
