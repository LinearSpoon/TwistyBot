var moment = require("moment-timezone");

// Cache stuff
var cache = {};
var cache_initialized = false;
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
			cache_initialized = true;
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

async function update_cache()
{
	const time_format = 'YYYY-MM-DD%20HH:mm:ss';
	// Build url to request posts since last update
	var url = config.get('rsj_api') + '&after=' + last_update.format(time_format);
	var now = moment().tz('UTC');
	var posts = JSON.parse(await util.download(url));

	if (posts.length > 0)
	{
		console.log('Updating RSJ cache with', posts.length, 'new posts.');
		if (cache_initialized)
		{
			var ae = announcement_embed(posts);
			for(var i in posts)
			{
				var new_post = to_detail_object(posts[i]);
				var old_post = cache[new_post.id];

				if (ae.fields.length < 25)
				{
					if (old_post)
					{ // Modified post
						if (old_post.player != new_post.player)
							ae.addField('Name changed: ' + old_post.player + ' => ' + new_post.player, new_post.url);
					}
					else
					{ // Brand new post
						ae.addField('Post published: ' + new_post.player, new_post.url);
					}
				}
				// Store returned posts indexed by id
				cache[new_post.id] = new_post;
			}
			if (ae.fields.length > 0)
			{
				//Discord.bot.get_text_channel('Twisty-Test.logs').sendEmbed(ae);
				Discord.bot.get_text_channel('RS JUSTICE.live-feed').sendEmbed(ae, 'RSJustice has been updated!');
			}
		}
		else
		{
			// First time run, don't sent to logs channel
			for(var i in posts)
			{
				var new_post = to_detail_object(posts[i]);
				cache[new_post.id] = new_post;
			}
		}

	}
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

// if player is found => [ details, ... ]
// if player is not found => []
// other error => throw
module.exports.lookup = async function(username, include_private) {
	await cache_promise;
	username = to_searchable_name(username);
	var matches = [];
	var posts = get_posts(include_private).forEach(function(post) {
		// Check if player is currently known by this name
		if (post._name == username)
			return matches.unshift(post);
		// Check if player was previously known by this name
		if (post._previous_names.indexOf(username) > -1)
			return matches.push(post);
	});

	return matches;
};

// Find closest matches to the passed name
module.exports.get_similar_names = function(name, include_private)
{
	var posts = get_posts(include_private);

	var all_names = Array.prototype.concat.apply(
		posts.map(e => e.player), // current names
		posts.map(e => e.previous_names)); // previous names

	return util.fuzzy_match(
		name, // needle
		all_names, // haystack
		{ // weights
			insert: 10,
			multiple_insert: 10,
			delete: 12
		}).slice(0, 5);
};

// Create embed for announcing posts
function announcement_embed(posts)
{
	var e = new Discord.RichEmbed();
	e.setColor(0x87CEEB);
//	e.setAuthor('RSJustice has been updated!');
	if (posts.length > 25)
		ae.setDescription('Note: ' + posts.length + ' posts were updated. Only showing the first 25.');
	return e;
}

function to_searchable_name(name)
{
	return name.replace(/[-_]/g,' ').toLowerCase();
}

// Convert raw post to something more convenient
function to_detail_object(post)
{
	var search_name = to_searchable_name(post.title);
	var search_tags = post.tags.map(to_searchable_name);
	return {
		id: post.id,
		url: 'http://rsjustice.com/' + post.link,
		player: post.title,
		reason: post.reason.replace(/&amp;/g, '&'),
		date_created: new Date(post.date + 'Z'),
		date_modified: new Date(post.modified + 'Z'),
		status: post.status,
		previous_names: post.tags
			.filter(e => to_searchable_name(e) != search_name), // Remove current name
		_name: search_name,
		_previous_names: search_tags,
	};
}
