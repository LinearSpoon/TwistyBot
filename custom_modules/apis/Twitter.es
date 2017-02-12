var Twitter = require('twitter');

var client = new Twitter(config.get('twitter_keys'));
var stream = client.stream('statuses/filter',	{ follow: [
		'1712662364', // Ash
		'734716002831900672', // West
		'3362141061', // Kieren
		'1307366604', // Mat K
		'2818884683', // Archie
		'2585470393', // Ronan
		'2984275535', // Merchant
		//'2926510103', // Linear Spoon
	].join(',') });


stream.on('data', function(event) {
	try {
		if (event.retweeted_status)
			return; // Don't care about retweets
		console.log(event);
	  Discord.bot.get_text_channel('Twisty-Test.jagextweets').sendEmbed(tweet_embed(event));
	} catch(e) {
		Discord.bot.get_text_channel('Twisty-Test.jagextweets').sendmsg(e.trace);
	}
});

stream.on('error', function(error) {
  Discord.bot.get_text_channel('Twisty-Test.jagextweets').sendmsg(error.trace);
});

// https://dev.twitter.com/streaming/overview/messages-types
function tweet_embed(tweet)
{
	// Fix up the @user references to link to their profile
	// https://twitter.com/linear_spoon
	var mentions = tweet.entities.user_mentions;
	var prev_index = [ 0, 0 ];
	var final_text = '';
	for(var i = 0; i < mentions.length; i++)
	{
		final_text += tweet.text.slice(prev_index[1], mentions[i].indices[0]); // Text before entity
		final_text += masked_tweet( tweet.text.slice(mentions[i].indices[0], mentions[i].indices[1]), mentions[i].screen_name );
		prev_index = mentions[i].indices;
	}
	final_text += tweet.text.slice(prev_index[1]); // Whatever is left




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

	if (tweet.entities.media.length)
		e.setImage(tweet.entities.media[0].media_url_https);
	
	return e;
}

function masked_tweet(text, username, id)
{
	if (id)
		return '[' + text + '](https://twitter.com/' + username + '/status/' + id + ')';
	else
		return '[' + text + '](https://twitter.com/' + username + ')';
}
