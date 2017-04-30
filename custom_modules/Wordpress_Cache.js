const EventEmitter = require('events');

class Wordpress_Cache extends EventEmitter
{
	constructor(endpoint, password)
	{
		super();
		// api endpoint, eg: http://xyz.com/wp-json/abc
		this.endpoint = endpoint;
		// api password
		this.password = password;
		// Time of most recent post
		this.last_update = '1970-01-01 00:00:00';
		// Post cache, key = post id, value = post object
		this.posts = {};

		// cache_promise resovles when we first get data
		this.cache_promise = this.download_posts(999)
			.then(posts => {
				// Save posts into cache
				posts.forEach(p => this.posts[p.id] = p);
				// Continue to update cache every 5 minutes
				setInterval(this.check_posts.bind(this), 300000);
			});
	}

	async download_posts(attempts)
	{
		// Build url to request posts since last update
		var url = this.endpoint + '?password=' + this.password + '&after=' + encodeURIComponent(this.last_update);
		try
		{
			var res = await util.queue_request(url, {
				max_attempts: attempts,
				success_delay: 8000,
				failure_delay: 8000,
			});

			var wp_posts = JSON.parse(res.body);

			console.log(url + ` => [${wp_posts.length}]`);

			if (wp_posts.length > 0)
			{ // Next request, get posts after the most recent post we know about
				this.last_update = wp_posts[0].modified;
			}

			// Convert wp_post to something useful
			return wp_posts.map(post => {
				var search_name = to_searchable_title(post.title);
				return {
					id: post.id,
					url: this.endpoint.replace(/wp-json.+/, post.link),
					player: post.title,
					reason: post.reason.replace(/&amp;/g, '&'),
					date_created: new Date(post.date + 'Z'),
					date_modified: new Date(post.modified + 'Z'),
					status: post.status,
					custom: post.custom,
					previous_names: post.tags
						.filter(e => to_searchable_title(e) != search_name), // Remove current name
					_name: search_name,
					_previous_names: post.tags.map(to_searchable_title)
				};
			});
		} catch(e) {
			// Probably request error
			console.warn('Error downloading wordpress posts! ' + e.message + ' \nfrom ' + url);
			// Return empty array to be safe, but don't update time
			return [];
		}
	}

	async check_posts()
	{
		var posts = await this.download_posts(1);
		posts.forEach(post => {
			// Save old version
			var old_post = this.posts[post.id];
			// Save new post
			this.posts[post.id] = post;

			if (old_post)
			{
				super.emit('modify_' + post.status, post, old_post); // revision
			}
			else
			{
				super.emit('new_' + post.status, post); // new post
			}
		});
	}

	async get_posts(types)
	{
		await this.cache_promise;
		var matching_posts = [];
		for(var k in this.posts)
		{
			if (types.includes(this.posts[k].status))
				matching_posts.push(this.posts[k]);
		}
		return matching_posts;
	}

	// if post is found => [ details, ... ]
	// if found, current name is listed first
	// if post is not found => []
	// other error => throw
	async find(username, types)
	{
		var posts = await this.get_posts(types);
		var matches = [];
		username = to_searchable_title(username);
		posts.forEach(function(post) {
				// Check if player is currently known by this name
				if (post._name == username)
					return matches.unshift(post);
				// Check if player was previously known by this name
				// Note: _previous_names includes current name, check it after _name
				if (post._previous_names.includes(username))
					return matches.push(post);
			});
		return matches;
	}

	// Find closest matches to given username
	async find_similar(username, types)
	{
		var posts = await this.get_posts(types);
		// Flatten all names to one array
		var all_names = Array.prototype.concat.apply(
			posts.map(p => p.player),
			posts.map(p => p.previous_names)
		);

		var score_limit = username.length < 5 ? 30 : 10 + 5 * username.length;
		return util.fuzzy_match(
			username, // needle
			all_names, // haystack
			{ // weights
				insert: 10,
				multiple_insert: 10,
				delete: 12,
			},
			to_searchable_title // converter
		).filter(e => e.score < score_limit);
	}
}


// Convert post title format to make titles comparable with ==
function to_searchable_title(title)
{
	return title.replace(/[-_]/g,' ').toLowerCase();
}

module.exports = Wordpress_Cache;
