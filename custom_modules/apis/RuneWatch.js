const Wordpress_Cache = custom_require('Wordpress_Cache');
var rw_cache = new Wordpress_Cache(config.get('rw_endpoint'), config.get('rw_password'));

class live_feed {
	constructor(channel)
	{
		this.channel = channel;
		this.embed = new Discord.RichEmbed();
	}

	// Add another field to embed
	// Send if embed is full or wait 1 second for more fields to come in
	queue(title, text)
	{
		console.log('queue' + title);
		if (this.timeout)
			clearTimeout(this.timeout);
		this.embed.addField(title, text);
		if (this.embed.fields.length >= 25)
			this.send();
		else
			this.timeout = setTimeout(this.send.bind(this), 1000);
	}

	send()
	{
		if (this.embed.fields.length == 0)
			return;
		this.embed.setColor(0x87CEEB);
		Discord.bot.get_text_channel(this.channel).sendEmbed(this.embed);
		this.embed = new Discord.RichEmbed();
	}
}

var public_feed = new live_feed(config.get('live') ? 'RuneWatch.live_feed' : 'Twisty-Test.feed');

// Public cases
rw_cache.on('new_publish', function(new_post) {
	public_feed.queue('New post: ' + new_post.player, new_post.url + '\n' + new_post.reason);
});

rw_cache.on('modify_publish', function(new_post, old_post) {
	if (new_post.player != old_post.player)
	{
		public_feed.queue('Name changed: ' + old_post.player + ' ⟹ ' + new_post.player, new_post.url + '\n' + new_post.reason);
	}
	if (new_post.status != old_post.status)
	{ // Consider it a new post if public
		public_feed.queue('New post: ' + new_post.player, new_post.url + '\n' + new_post.reason);
	}
});




module.exports = rw_cache;
