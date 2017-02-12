var he = require('he');
var Twitter = require('twitter');

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
var stream = client.stream('statuses/filter',	{ follow: mods.join(',') });


stream.on('data', function(event) {
	try {
		if (event.retweeted_status)
			return; // Don't care about retweets
		console.log(event);
	  Discord.bot.get_text_channel('Twisty-Test.jagextweets').sendEmbed(tweet_embed(event))
	} catch(e) {
		Discord.bot.get_text_channel('Twisty-Test.logs').sendmsg(e.message);
	}
});

stream.on('error', function(error) {
  var channel = Discord.bot.get_text_channel('Twisty-Test.logs');
	if (channel)
		channel.sendmsg(error.trace);
	else
		console.error(error.trace);
});

// https://dev.twitter.com/streaming/overview/messages-types
function tweet_embed(tweet)
{
	// Fix up the @user references to link to their profile
	var mentions, text, media;
	if (tweet.extended_tweet)
	{
		if (tweet.entities.user_mentions)
			mentions = tweet.entities.user_mentions;
		text = tweet.text;
		if (tweet.entities.media)
			media = tweet.entities.media
	}
	else
	{
		if (tweet.extended_tweet.entities.user_mentions)
			mentions = tweet.extended_tweet.entities.user_mentions;
		text = tweet.extended_tweet.full_text;
		if (tweet.extended_tweet.entities.media)
			media = tweet.extended_tweet.entities.media
	}
	if (mentions && mentions.length > 0)
	{
		var prev_index = [ 0, 0 ];
		var final_text = '';
		for(var i = 0; i < mentions.length; i++)
		{
			final_text += he.decode(text.slice(prev_index[1], mentions[i].indices[0])); // Text before entity
			final_text += he.decode(masked_tweet( text.slice(mentions[i].indices[0], mentions[i].indices[1]), mentions[i].screen_name ));
			prev_index = mentions[i].indices;
		}
		final_text += text.slice(prev_index[1]); // Whatever is left
	}
	else
	{
		final_text = text;
	}

	var e = new Discord.RichEmbed();
	e.setAuthor(tweet.user.screen_name, null, 'https://twitter.com/' + tweet.user.screen_name);
	e.setThumbnail(tweet.user.profile_image_url);
	e.setTimestamp(new Date(parseInt(tweet.timestamp_ms)));

	var links = [
		masked_tweet('View on Twitter', tweet.user.screen_name, tweet.id_str)
	];
	if (tweet.in_reply_to_status_id_str)
		links.push(masked_tweet('Replying to ' + tweet.in_reply_to_screen_name, tweet.in_reply_to_screen_name, tweet.in_reply_to_status_id_str));

	e.setDescription(final_text + '\n\n' + links.join('\n'));

	// Media is undefined if there are no links
	if (media && media.length > 0)
		e.setImage(media[0].media_url_https);

	if (mods.indexOf(tweet.user.id_str) > -1)
		e.setColor(0xFFD700);

	return e;
}

function masked_tweet(text, username, id)
{
	if (id)
		return '[' + text + '](https://twitter.com/' + username + '/status/' + id + ')';
	else
		return '[' + text + '](https://twitter.com/' + username + ')';
}
