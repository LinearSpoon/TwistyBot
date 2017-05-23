global.server_directory = __dirname;
require('./globals.js');

Discord.bot.on('ready', function() {
	console.log('Event: ready');
	Discord.bot.user.setPresence({ game: { name: '!commands' } });
});
Discord.bot.on('disconnect', () => console.warn('Event: disconnected'));
Discord.bot.on('guildMemberAdd', member => console.log('[New member]', member.guild.name + ':', member.user.username));
Discord.bot.on('guildUnavailable', guild => console.log('[Guild unavailable]', guild.name));
Discord.bot.on('messageDelete', message => log_message('Del', message));
Discord.bot.on('messageDeleteBulk', message_coll => message_coll.array().forEach(message => log_message('Del', message)));
Discord.bot.on('messageUpdate', (old_message,new_message) => log_message('Mod', new_message));
Discord.bot.on('reconnecting', () => console.log('Event: reconnecting'));
Discord.bot.on('warn', msg => console.warn('Event: warning', msg));
Discord.bot.on('error', err => console.error('Event: error', err));

function log_message(explanation, message)
{
	if (message.embeds.length > 0 && message.cleanContent == '')
		return;

	console.log('[' + explanation + ']',
		'[' + message.channel.get_name() + ']',
		message.author.username + ':',
		message.cleanContent);
}

// Load commands
var commands = custom_require('commands');

// Parse command and execute
Discord.bot.on('message', function(message) {
	if (message.author.id == Discord.bot.user.id || message.channel.type == 'voice')
		return; // Ignore own messages or messages in voice channels (is it possible?)

	log_message('New', message);

	var prefix = message.get_command_prefix();
	var content = message.cleanContent;

	if (!content.startsWith(prefix))
		return; // Not a command

	// It is a mobile command if the prefix is duplicated
	var is_mobile_command = content.startsWith(prefix, prefix.length);

	// Remove prefix from content
	content = content.slice(is_mobile_command ? 2 * prefix.length : prefix.length);

	// Try to extract the command name
	var match = content.match(/^([a-zA-Z_]+)\s*,?/);
	if (!match)
		return; // Not a command

	var command = commands[match[1].toLowerCase()]; // Get command object
	if (!command)
	 	return; // Not a valid command

	var params = content.slice(match[0].length).trim();	// Extract params without command name
	params = params == '' ? [] : params.split(',').map(e => e.trim());	// Split comma separated parameters

	if (!message.check_permissions(config.get('global_permissions').concat(command.permissions)))
	{
		return; // Permission denied
	}

	if (params.length < command.params.min || params.length > command.params.max)
	{ // Invalid number of parameters, show parameter help text
		return message.channel.sendMessage(Discord.code_block(command.params.help));
	}

	message.channel.startTyping();
	// TODO: startTyping can reject?

	var p = command.command.call(commands, message, params);

	p.then( function(response) {
		// Command finished with no errors
		if (!response)
		{
			console.log('Command did not respond');
			return; // Nothing to send
		}

		// Convert to an array
		if (!Array.isArray(response))
			response = [ response ];

		return Promise.all(response.map( function(text, idx) {
			return message.channel.sendmsg(text)
				.catch( function(err) {
					if (err.message == 'Forbidden')
					{ // TwistyBot probably doesn't have permission to talk here, send it to user's PM
						if (idx == 0)
						{
							var explanation = 'Hi, TwistyBot was unable to respond to your command in ' + message.channel.get_name() + '.\n'
							+ 'If you want TwistyBot to respond in that channel, please ensure that it has permissions to send messages and embed links.'
							+ '\n' + message.cleanContent + '\n';
						}

						if (text instanceof Discord.RichEmbed)
							return message.author.sendEmbed(text, explanation);
						else
							return message.author.sendmsg(explanation ? explanation + text : text);
					}
				});
		}));
	})
	.catch( function(err) {
		// Something terrible happened
		console.warn(err.stack);
		message.channel.sendMessage(Discord.code_block('An error occurred while running the command:\n' + err.message));

		Discord.bot.get_text_channel('Twisty-Test.logs').sendMessage(Discord.code_block(
			'Channel: ' + message.channel.get_name()
		 	+ '\nAuthor:  ' + message.author.username + '#' + message.author.discriminator
		 	+ '\nMessage: ' + message.cleanContent
			+ '\n' + err.stack));
	})
	.then( () => message.channel.stopTyping() );
});

// Log unhandled promises
process.on('unhandledRejection', function(err) {
	console.error('Promise Rejected!!!');
	console.warn(err.stack);

	Discord.bot.get_text_channel('Twisty-Test.logs').sendMessage(Discord.code_block('Unhandled promise!\n' + err.stack))
		.catch(e => console.error('Error logging:', err)) ;
	//throw err;
});


async function start_servers()
{
	return Discord.bot.login(config.get('token'));
}

// These functions must return a promise
custom_require('singleinstance')(start_servers, () => Promise.resolve());
