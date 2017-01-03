var request = require('request');

// Useful variables
// res.body => string response from server
// res.statusCode => HTML status code
// res.statusMessage => string status code meaning
// Note:  This will not throw if the page is not found, make sure to check to check res.statusCode == 200

// Parameter can be a url or an options object
// options.url = "http://..."
// options.method = "GET"
// options.headers = {...}
// See all at: https://www.npmjs.com/package/request#requestoptions-callback
module.exports = function(url_or_options) {
	return new Promise(function(resolve, reject) {
		request(url_or_options, function(err, res, body) {
			return err ? reject(err) : resolve(res);
		});
	});
};
