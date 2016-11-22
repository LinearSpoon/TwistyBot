var cheerio = require('cheerio');

var rsj_cache = [];
rsj_cache.last_update = 0;

// if player is found => details object
//   details.url
//   details.player
//   details.reason
// if player is not found => undefined
// other error => throw
module.exports.lookup = async function(username) {
	await update_cache();
	username = username.toLowerCase();
	return rsj_cache.find( e => e.player.toLowerCase() == username);
};

async function update_cache()
{
	if (rsj_cache.length > 0 && Date.now() - rsj_cache.last_update < 1000 * 3600)
		return; // Do not update if cache less than 1 hour old

	var body = await util.download('http://rsjustice.com/');

	// I hate HTML
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

	if (rsj_cache.length == 0)
		console.warn('RSJ cache update probably broken.');

	rsj_cache.last_update = Date.now();
}
