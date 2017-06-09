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
Discord.bot.on('message', async function(message) {
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

	// We need to respond, but do we have permission?
	var have_permission = true;
	var output_channel = message.channel;

	// Only check in guild text channels
	if (message.channel.type == 'text')
	{
		have_permission = message.channel.permissionsFor(Discord.bot.user).has('SEND_MESSAGES');
		// If we don't have permission, redirect to sender's DM
		if (!have_permission)
		{
			output_channel = message.author.dmChannel || await message.author.createDM();
		}
	}


	if (params.length < command.params.min || params.length > command.params.max)
	{ // Invalid number of parameters, show parameter help text
		return output_channel.sendMessage(Discord.code_block(command.params.help));
	}

	output_channel.startTyping();

	command.command.call(commands, message, params)
		.then( function(response) {
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
				if (!have_permission && idx == 0)
				{ // First message of a command from a channel where we don't have permission to reply
					let explanation = 'Hi, TwistyBot was unable to respond to your command in ' + message.channel.get_name() + '.\n'
					+ 'If you want TwistyBot to respond in that channel, please ensure that it has permissions to send messages and embed links.'
					+ '\n' + message.cleanContent + '\n';

					if (text instanceof Discord.RichEmbed)
						return output_channel.sendEmbed(text, explanation);
					else
						return output_channel.sendmsg(explanation ? explanation + text : text);
				}
				else
				{
					return output_channel.sendmsg(text);
				}
			}));
		})
		.catch( function(err) {
			// Something terrible happened
			console.warn(err.stack);
			output_channel.sendMessage(Discord.code_block('An error occurred while running the command:\n' + err.message));

			Discord.bot.get_text_channel('Twisty-Test.logs').sendMessage(Discord.code_block(
				'Channel: ' + message.channel.get_name()
			 	+ '\nAuthor:  ' + message.author.username + '#' + message.author.discriminator
			 	+ '\nMessage: ' + message.cleanContent
				+ '\n' + err.stack));
		})
		.then( () => output_channel.stopTyping() );
});

// Log unhandled promises
process.on('unhandledRejection', function(err) {
	console.error('Promise Rejected!!!');
	console.warn(err.stack);

	Discord.bot.get_text_channel('Twisty-Test.logs').sendMessage(Discord.code_block('Unhandled promise!\n' + err.stack))
		.catch(e => console.error('Error logging:', err)) ;
	//throw err;
});

// Login
Discord.bot.login(config.get('token'));
