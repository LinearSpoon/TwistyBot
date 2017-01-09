var moment = require("moment-timezone");

var cache = {};
var last_update = moment(0).tz('UTC');
var cache_promise = initialize_cache();

async function initialize_cache()
{
	for(var attempt = 0; attempt < 999; attempt++)
	{
		try
		{
			await update_cache();
			console.log('RSJ loaded.');
			// Continue to update cache every 5 minutes
			setInterval(update_cache, 300000);
			return; // done
		}
		catch(e)
		{
			console.warn('RSJ failed: ', e);
			// Every third failed attempt, wait 90 seconds instead of 5 seconds
			await util.sleep(attempt % 3 == 0 ? 90000 : 5000);
		}
	}
}

// Convert raw post to something more convenient
function to_detail_object(post)
{
	return {
		id: post.id,
		url: 'http://rsjustice.com/' + post.link,
		player: post.title,
		reason: post.reason,
		date_created: new Date(post.date + 'Z'),
		date_modified: new Date(post.modified + 'Z'),
		status: post.status,
		previous_names: post.tags.filter(e => e.toLowerCase() != post.title.toLowerCase())
	};
}

async function update_cache()
{
	const time_format = 'YYYY-MM-DD%20HH:mm:ss';
	// Build url to request posts since last update
	var url = config.get('rsj_api') + '&after=' + last_update.format(time_format);
	console.log(url);
	var now = moment().tz('UTC');
	var posts = JSON.parse(await util.download(url));
	// Store returned posts indexed by id
	for(var i in posts)
		cache[posts[i].id] = to_detail_object(posts[i]);
	console.log('Updated RSJ cache with', posts.length, 'new posts.');
	//console.log(posts);
	last_update = now;
}

function get_posts(include_private)
{
	var posts = [];
	for(var i in cache)
	{
		if (include_private && cache[i].status == 'private' || cache[i].status == 'publish')
			posts.push(cache[i]);
	}
	return posts;
}

// if player is found => details object
// if player is not found => undefined
// other error => throw
module.exports.lookup = async function(username, include_private) {
	await cache_promise;
	username = username.toLowerCase().replace(/[-_]/g,' ');
	var matches = [];
	var posts = get_posts(include_private).forEach(function(post) {
		// Check if player is currently known by this name
		if (post.player.toLowerCase() == username)
			return matches.unshift(post);
		// Check if player was previously known by this name
		var name_history = post.previous_names.map(e => e.toLowerCase());
		if (name_history.indexOf(username) > -1)
			return matches.push(post);
	});

	return matches;
};

// Find closest matches to the passed name
module.exports.get_similar_names = function(name, include_private)
{

	return util.fuzzy_match(name, get_posts(include_private).map(e => e.player)).slice(0, 5);
};
