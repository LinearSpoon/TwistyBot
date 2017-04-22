if (!config.get('live'))
	return;

var he = require('he');
var Twitter = require('node-tweet-stream');

const mods = [
	'1712662364', // Ash
	'734716002831900672', // West
	'3362141061', // Kieren
	'1307366604', // Mat K
	'2818884683', // Archie
	'2585470393', // Ronan
	'2984275535', // Merchant
	'2926510103', // Linear Spoon
];

var client = new Twitter(config.get('twitter_keys'));
//var stream = client.stream('statuses/filter',	{ follow: mods.join(',') });
client.follow(mods.join(','));

client.on('tweet', async function(event) {
	try {
		if (event.retweeted_status)
			return; // Don't care about retweets

		// Save tweet
		var tweet = await save_tweet(event);
		if (mods.indexOf(tweet.sender) == -1)
			return;  // Not a jmod

		// Load conversation and create Discord embed
		var embed = await tweet_embed(tweet);
		Discord.bot.get_text_channel('Twisty-Test.jagextweets').sendEmbed(embed)
	} catch(e) {
		Discord.bot.get_text_channel('Twisty-Test.logs').sendmsg('ontweet: ' + Discord.code_block(e.stack));
	}
});

client.on('error', function(error) {
  var channel = Discord.bot.get_text_channel('Twisty-Test.logs');
	if (channel)
		channel.sendmsg(error.trace);
	else
		console.error(error.trace);
});

client.on('reconnect', function (msg) {
	var channel = Discord.bot.get_text_channel('Twisty-Test.logs');
	if (channel)
		channel.sendmsg(msg);
	else
		console.error(msg);
})

// https://dev.twitter.com/streaming/overview/messages-types
async function save_tweet(tweet)
{
	var mentions, text, media, final_text, urls;
	if (tweet.extended_tweet)
	{
		if (tweet.extended_tweet.entities.user_mentions)
			mentions = tweet.extended_tweet.entities.user_mentions;
		text = tweet.extended_tweet.full_text;
		if (tweet.extended_tweet.entities.media)
			media = tweet.extended_tweet.entities.media

		urls = tweet.extended_tweet.entities.urls;
	}
	else
	{
		if (tweet.entities.user_mentions)
			mentions = tweet.entities.user_mentions;
		text = tweet.text;
		if (tweet.entities.media)
			media = tweet.entities.media

		urls = tweet.entities.urls;
	}

	// tweet.in_reply_to_screen_name == mentions.screen_name

	// Fix up the @user references to link to their profile
	if (mentions && mentions.length > 0)
	{
		var prev_index = [ 0, 0 ];
		final_text = '';
		for(var i = 0; i < mentions.length; i++)
		{
			final_text += he.decode(text.slice(prev_index[1], mentions[i].indices[0])); // Text before entity
			if (tweet.in_reply_to_screen_name != mentions[i].screen_name)
			{ // The user is already saved by id, no need to see their @user mention in the tweet
				final_text += he.decode(masked_tweet( text.slice(mentions[i].indices[0], mentions[i].indices[1]), mentions[i].screen_name ));
			}
			prev_index = mentions[i].indices;
		}
		final_text += he.decode(text.slice(prev_index[1])); // Whatever is left
	}
	else
	{
		final_text = text;
	}

	// Remove funky characters (node-mysql does not currently support the required charset)
	final_text = final_text.replace(/[\u0800-\uFFFF]/g, '');
	// Replace short urls with actual urls
	for(var i in urls)
		final_text = final_text.replace(urls[i].url, urls[i].expanded_url);

	var first_media = media && media.length > 0 ? media[0].media_url_https : null;

	// Save tweet to database
	await database.query(
		`INSERT INTO twitter.users
			SET id = ?, username = ?, profile_image = ?
			ON DUPLICATE KEY UPDATE id=id;
		INSERT INTO twitter.tweets
			SET id = ?, sender = ?, text = ?, reply_to = ?, first_media = ?, timestamp = ?
			ON DUPLICATE KEY UPDATE id=id;`,
			tweet.user.id_str, // users.id
			tweet.user.screen_name, // users.username
			tweet.user.profile_image_url, // users.profile_image
			tweet.id_str, // tweets.id
			tweet.user.id_str, // tweets.sender
			final_text, // tweets.text
			tweet.in_reply_to_status_id_str, // tweets.reply_to
			first_media, // tweets.first_media
			parseInt(tweet.timestamp_ms)
		);
	// Return tweet as if it was loaded by load_tweet
	return {
		id: tweet.id_str,
		username: tweet.user.screen_name,
		profile_image: tweet.user.profile_image_url,
		sender: tweet.user.id_str,
		text: final_text,
		reply_to: tweet.in_reply_to_status_id_str,
		first_media: first_media,
		timestamp: parseInt(tweet.timestamp_ms)
	};
}

async function load_tweet(tweet_id)
{
	if (!tweet_id)
		return;

	var tweets = await database.query(
		// select tweets.* last, because user.id would override tweet.id
		`SELECT users.*, tweets.*  FROM twitter.tweets AS tweets
			JOIN twitter.users AS users
			ON users.id = tweets.sender
			WHERE tweets.id = ?`, tweet_id);

	if (tweets.length > 0)
		return tweets[0];
}


const distinct_colors = [
	0xa6cee3, // light blue
	0x1f78b4, // blue
	0x00ffcc, // bright blue
	0xb2df8a, // light green
	0x33a02c, // green
	0x7fff00, // bright green
	0xfb9a99, // light red (pink)
	0xe31a1c, // red
	0xcab2d6, // light purple
	0x6a3d9a, // purple
	0x111111, // dark gray
	0xeeeeee, // light gray
	0xff00e5, // bright pink
	0x0019ff, // dark blue
	0xff6600, // orange
];
async function tweet_embed(tweet)
{
	var e = new Discord.RichEmbed();
	// Extract information from original tweet
	//e.setThumbnail(tweet.profile_image);
	e.setTimestamp(new Date(tweet.timestamp));
	var link = 'https://twitter.com/' + tweet.username + '/status/' + tweet.id;

	// Pull the entire conversation if possible
	var conversation = [ tweet ];
	while( tweet && tweet.reply_to )
	{
		tweet = await load_tweet(tweet.reply_to);
		conversation.unshift(tweet);
	}

	// Replay the conversation
	// Oldest tweet = 0
	for(var i = 1; i < conversation.length; i++)
	{
		var tweet = conversation[i];
		e.addField(tweet.username, tweet.text);
		if (tweet.first_media && !e.image)
			e.setImage(tweet.first_media);
	}

	e.setColor(0xa6cee3); // light blue

	if (conversation_has_keyword(conversation, ['support team', 'FAQ']))
	{
		e.setColor(0x555555); // Gray
	}

	if (conversation_has_keyword(conversation, ['olm', 'raid', 'twisted', 'tbow']))
	{
		e.setColor(0xFFD700); // JMod gold
	}

	// The oldest tweet is first in the array
	var oldest = conversation[0];
	if (oldest)
	{
		e.setAuthor(oldest.username, null, link);
		e.setDescription(oldest.text);
		if (oldest.first_media)
			e.setImage(oldest.first_media);
	}
	else
	{
		e.setAuthor('Warning!', null, link);
		e.setDescription('Could not load entire conversation.\n[View on Twitter](' + link + ')');
	}


	return e;
}

function masked_tweet(text, username, id)
{
	if (id)
		return '[' + text + '](https://twitter.com/' + username + '/status/' + id + ')';
	else
		return '[' + text + '](https://twitter.com/' + username + ')';
}

function conversation_has_keyword(conversation, keywords)
{
	for(var i = 0; i < conversation.length; i++)
	{
		var text = conversation[i].text.toLowerCase();
		for(var j = 0; j < keywords.length; j++)
			if (text.includes(keywords[j]))
				return true;
	}
	return false;
}
