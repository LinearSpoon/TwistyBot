var cheerio = require('cheerio');

const one_hour = 1000 * 60 * 60;


var cache = {
	error: null, // Last error
	attempts: 0, // Number of failed updates
	next_update: 0, // Next possible time that we can request RSJ update
	players: []
};

// if player is found => details object
//   details.url
//   details.player
//   details.reason
// if player is not found => undefined
// other error => throw
module.exports.lookup = async function(username) {
	await update_cache();
	if (cache.error)
		throw cache.error;
	username = username.toLowerCase();
	return cache.players.find( e => e.player.toLowerCase() == username);
};

async function update_cache()
{
	if (Date.now() < cache.next_update)
		return; // Do not update if cache less than 1 hour old

	try
	{
		var res = await util.request('http://rsjustice.com/index/');
		// A kludge because RSJ returns 404 even when the page loads successfully
		if (res.statusCode != 200 && res.statusCode != 404)
			throw Error('Bad request: (' + res.statusCode + ' ' + res.statusMessage + ')');
		var players = [];
		// Parse the page for players
		var $ = cheerio.load(res.body);
		$('div .su-tabs-pane.su-clearfix > ul.lcp_catlist:last-of-type > li').each(function(i,e) {
				var data = $(this).children();
				players.push({
					url: data.attr('href'),
					player: data.attr('title'),
					reason: data.get(0).next.data.trim()
				});
		});
		if (players.length == 0)
			throw Error('Unable to parse RSJustice HTML');
		// Else, players loaded successfully
		cache.error = null;
		cache.attempts = 0;
		cache.players = players;
		cache.next_update = Date.now() + one_hour;
	}
	catch(e)
	{ // Some error occurred, log it and rethrow
		cache.attempts += 1;
		if (cache.attempts >= 3)
		{
			// Too many failures since the last update
			// Set update time so that no requests are made for an hour
			e = Error('Too many failed RSJustice lookups. Giving up for an hour.');
			cache.next_update = Date.now() + one_hour;
		}
		cache.error = e;
		throw e;
	}
}

module.exports.is_limited = function() {
	return cache.error // There was an error
		&& Date.now() < cache.next_update; // and the last attempt was less than an hour ago
};
