var request = require('request');
var cheerio = require('cheerio');

var rsj_cache = [];
rsj_cache.last_update = 0;


module.exports.lookup = function(username) {
	username = username.toLowerCase();
	return update_cache()
		.then( () => rsj_cache.find( e => e.player.toLowerCase() == username) );
};

function update_cache()
{
	if (rsj_cache.length > 0 && Date.now() - rsj_cache.last_update < 1000 * 3600)	// if cache less than 1 hour old
		return Promise.resolve();

	return new Promise(function(resolve, reject) {
		request('http://rsjustice.com/', function(err, res, body) {
			if (err)
				return reject(err);
			if (res.statusCode != 200)
				return reject(new Error('Unknown HTML status code: ' + res.statusCode));

			//console.log(body);
			var $ = cheerio.load(body);
			rsj_cache = [];
			$('div .su-tabs-pane.su-clearfix > ul.lcp_catlist:last-of-type > li').each(function(i,e) {
					var data = $(this).children();
					rsj_cache.push({
						url: data.attr('href'),
						player: data.attr('title'),
						reason: data.get(0).next.data.trim()
					});
			});
			rsj_cache.last_update = Date.now();
			return resolve(body);
		});
	});
}
