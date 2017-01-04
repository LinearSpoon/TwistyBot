const five_minutes = 1000 * 60 * 5;

var cache = {
	error: null, // Last error
	attempts: 0, // Number of failed updates
	next_update: 0, // Next possible time that we can request RSJ update
	players: []
};

// if player is found => details object
// if player is not found => undefined
// other error => throw
module.exports.lookup = async function(username, include_private) {
	await update_cache();
	if (cache.error)
		throw cache.error;

	username = username.toLowerCase().replace(/[-_]/g,' ');
	return to_detail_object(
		cache.players.find(function(e) {
			return e.title.toLowerCase() == username
				&& ((include_private && e.status == 'private')
				|| e.status == 'publish');
		})
	);
};

function to_detail_object(post)
{
	if (!post)
		return;

	return {
		id: post.id,
		url: 'http://rsjustice.com/' + post.link,
		player: post.title,
		reason: post.reason,
		date_created: new Date(post.date + 'Z'),
		date_modified: new Date(post.modified + 'Z')
	};
}

async function update_cache()
{
	if (Date.now() < cache.next_update)
		return; // Do not update if cache less than 1 hour old

	try
	{
		cache.players = JSON.parse(await util.download(config.get('rsj_api')));
		//cache.players = root_require('./bot.json');
		cache.error = null;
		cache.attempts = 0;
		cache.next_update = Date.now() + five_minutes;
	}
	catch(e)
	{ // Some error occurred, log it and rethrow
		cache.attempts += 1;
		if (cache.attempts >= 3)
		{
			// Too many failures since the last update
			// Set update time so that no requests are made for an hour
			e = Error('Too many failed RSJustice lookups. Try again in 5 minutes.');
			cache.next_update = Date.now() + five_minutes;
		}
		cache.error = e;
		throw e;
	}
}

// Returns true if we are holding our requests for a while
module.exports.is_limited = function() {
	return cache.error // There was an error
		&& Date.now() < cache.next_update; // and the last attempt was less than an hour ago
};
