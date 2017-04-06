var moment = require("moment-timezone");

// Cache stuff
var cache = {};
var last_update = moment(0).tz('UTC');
var cache_promise = download_posts(999)
	.then(function(posts) {
		// Save posts into cache
		posts.forEach(p => cache[p.id] = p);
		// Continue to update cache every 5 minutes
		setInterval(update_cache, 300000);
	});

async function download_posts(retries)
{
	const time_format = 'YYYY-MM-DD%20HH:mm:ss';
	// Build url to request posts since last update
	var url = config.get('rsj_api') + '&after=' + last_update.format(time_format);
	console.log(url)
	var res = await util.queue_request(url, {
		max_attempts: retries,
		success_delay: 8000,
		failure_delay: 8000,
	});
	last_update = moment().tz('UTC');
	return JSON.parse(res.body).map(post => to_detail_object(post));
}

async function update_cache()
{
	try {
		var posts = await download_posts(1);
	} catch(e) {
		console.warn('Error downloading RSJ posts:', e);
		return;
	}

	if (posts.length == 0)
		return;

	console.log('Updating RSJ cache with', posts.length, 'new posts.');

	if (config.get('live'))
	{
		var public_embed = new Discord.RichEmbed();
		var private_embed = new Discord.RichEmbed();
		public_embed.setColor(0x87CEEB);
		private_embed.setColor(0x87CEEB);

		// Find new posts with publish status
		var public_posts = posts.filter( p => !cache[p.id] && p.status == 'publish' );
		if (public_posts.length > 0)
		{
			if (public_posts.length > 25)
				public_embed.setDescription('Note: ' + public_posts.length + ' posts were updated. Only showing the first 25.');

			// Just show the first 25
			public_posts.slice(0, 25).forEach(function(new_post) {
				public_embed.addField('Post published: ' + new_post.player, new_post.url + '\n' + new_post.reason);
			});

			Discord.bot.get_text_channel('RS JUSTICE.public-chat').sendEmbed(public_embed);
		}

		// Find new posts and posts with changed names
		var private_posts = posts.filter( p => !cache[p.id] || (cache[p.id] && cache[p.id].player != p.player) );
		console.log(posts)
		console.log(posts.map(p => cache[p.id]))
		console.log(private_posts)

		if (private_posts.length > 0)
		{
			if (private_posts.length > 25)
				private_embed.setDescription('Note: ' + private_posts.length + ' posts were updated. Only showing the first 25.');

			private_posts.slice(0, 25).forEach(function(new_post) {
				if (!cache[new_post.id])
					private_embed.addField('Post published: ' + new_post.player, new_post.url + '\n' + new_post.reason);
				else
					private_embed.addField('Name changed: ' + cache[new_post.id].player + ' ⟹ ' + new_post.player, new_post.url + '\n' + new_post.reason);
			});

			Discord.bot.get_text_channel('RS JUSTICE.live-feed').sendEmbed(private_embed);
		}
	}
	// Save posts into cache
	posts.forEach(p => cache[p.id] = p);
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
	var matches = [];
	matches.searched_name = username;
	username = to_searchable_name(username);
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

	var score_limit = name.length < 5 ? 30 : 10 + 5 * name.length;

	return util.fuzzy_match(
		name, // needle
		all_names, // haystack
		{ // weights
			insert: 10,
			multiple_insert: 10,
			delete: 12,
		}).filter(e => e.score < score_limit);
};

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
		status: post.status, // 'publish' || 'private'
		previous_names: post.tags
			.filter(e => to_searchable_name(e) != search_name), // Remove current name
		_name: search_name,
		_previous_names: search_tags,
	};
}
