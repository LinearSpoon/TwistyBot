let Timer = src_require('classes/Timer');

// Sends an array of command responses
// Valid responses are strings, Discord.RichEmbed, or { content, options } (passed to message.send)
function send_response(responses, options)
{
	// Convert response to an array
	if (!Array.isArray(responses))
	{
		responses = [ responses ];
	}

	// Prepare the messages that need to be sent
	let messages = responses
		.filter(response => response) // Remove empty responses (null, undefined, "")
		.map(function(response) {
			// Convert response to { content, options } that can be passed to channel.send
			if (typeof response === 'string')
				return { content: response, options: {} };

			if (response instanceof Discord.RichEmbed)
				return { content: '', options: { embed: response } };

			// Default: assume it is already a { content, options } object
			return response;
		});

	if (messages.length == 0)
		return; // Nothing to send

	// If the response is redirected to the user's DM, add an explanation to the first message
	if (options.redirected)
	{
		messages[0].content = `Hi, ${ Discord.bot.user.username } doesn't have permission to respond in ${ options.channel.get_friendly_name() }\n`
			+ options.message.cleanContent + '\n' + messages[0].content;
	}

	// Identify any messages which are beyond the 2000 character limit and split them up
	let t = new Timer();
	let split_messages = [].concat(...messages.map(twistybot.split_message));
	console.log('Split messages (' + t.check() + ' ms):');
	split_messages.forEach(function(message) {
		console.log('-------------------------------------');
		console.log(message.content);
	});

	// Send the messages
	return Promise.all(split_messages.map( message => options.channel.send(message.content, message.options) ));
}

module.exports = send_response;
