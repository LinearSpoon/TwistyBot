// let Timer = src_require('classes/Timer');
let split_message = require('./split_message');
let Discord = require('discord.js');

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

			if (response instanceof Discord.Table)
				return { content: Discord.code_block(response.toString()), options: {} };

			if (response instanceof Discord.Attachment)
				return { content: '', options: response };

			if (typeof response === 'object' && response !== null)
				return response; // assume it is already a { content, options } object

			// Just hope it has a reasonable toString defined
			return { content: response.toString(), options: {} };
		});

	if (messages.length == 0)
		return; // Nothing to send

	// If the response is redirected to the user's DM, add an explanation to the first message
	if (options.redirected)
	{
		messages[0].content = `Hi, ${ this.user.username } doesn't have permission to respond in ${ options.channel.get_friendly_name() }\n`
			+ options.message.cleanContent + '\n' + messages[0].content;
	}

	// Identify any messages which are beyond the 2000 character limit and split them up
	// let t = new Timer();
	let split_messages = [].concat(...messages.map(split_message));
	// console.log('Split messages (' + t.check() + ' ms):');
	// split_messages.forEach(function(message) {
	// 	console.log('-------------------------------------');
	// 	console.log(message.content);
	// });

	// Send the messages
	return Promise.all(split_messages.map( message => options.channel.send(message.content, message.options) ));
}

module.exports = send_response;
