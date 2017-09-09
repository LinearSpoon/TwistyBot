/***************************************************************
 *                       Globals
 ***************************************************************/
 // Log unhandled promises
process.on('unhandledRejection', function(err) {
	console.error('Promise Rejected!!!');
	console.warn(err.stack);
});

global.server_directory = __dirname;
global.root_require = name => require(global.server_directory + '/' + name);
global.src_require = name => require(global.server_directory + '/src/' + name);

// Load custom console output
src_require('console_hook');

// Load config
global.config = Object.assign(
	root_require('config/default_config'),
	// First parameter is config file name, default = config
	root_require('config/' + (process.argv[2] || 'config'))
);

global.Discord = src_require('discordjs');
src_require('twistybot');

/***************************************************************
 *                       Bot events
 ***************************************************************/
Discord.bot.on('ready', function() {
	console.log('[Ready]');
});

Discord.bot.on('disconnect', function(event) {
	console.warn('[Disconnect]', event.code, event.reason);
});

function format_message(message)
{
	let string = '[' + message.channel.get_friendly_name() + '] ' + message.author.username + ': ';
	if (message.cleanContent == '' && message.embeds.length > 0)
	{
		string += message.embeds.map(function(embed) {
			return embed.author
				? '[Embed ' + (embed.author.url || embed.author.name) + '] '
				: '[Embed ' + (embed.url || embed.title || embed.description) + '] ';
		}).join('\n');
	}

	return string + message.cleanContent;
}

Discord.bot.on('message', async function(message) {
	console.log('[New]', format_message(message));

	if (message.author.id == Discord.bot.user.id)
		return; // Ignore own messages

	// Default options
	let options = {
		// Received message
		message: message,
		// Output channel, where the command response is to be sent
		channel: message.channel,
		// Guild preferences
		guild: null,
		// User preferences
		user: null, //twistybot.cache.user.get(message.author.id),
		// Command name
		name: null,
		// Command prefix
		prefix: '!',
		// Response type permissions (does the channel support text, embeds, etc?)
		text: true,
		embeds: true,
		files: true,
		reactions: true,
	};

	if (message.guild)
	{
		options.guild = twistybot.cache.guild.get(message.guild.id);
		// Let the guild prefix override the default
		options.prefix = options.guild.cmd_prefix;
	}

	// Does the message start with the prefix?
	let content = message.cleanContent;
	if (!content.startsWith(options.prefix))
		return; // Prefix not found

	// Remove prefix from message
	content = content.slice(options.prefix.length);

	// Extract command name
	let match = content.match(/^([a-zA-Z_]+)\s*,?/);
	if (!match)
		return; // Couldn't parse

	// Save command name
	options.name = match[1].toLowerCase();

	// Is this a real command?
	let cmd = twistybot.commands.names[options.name];
	if (!cmd)
		return; // Not a real command

	let allowed = twistybot.check_permission(
		message,
		// Global rules
		config.get('global_permissions'),
		// Command specific rules
		cmd.permissions
		// TODO: Guild leader rules

		// Default allow
	);

	if (!allowed)
	{
		console.log('Blocked ' + options.name);
		return;
	}

	// Determine where the reply will be sent and what features we can use in the response
	if (message.guild)
	{
		// In guilds, our permissions may be limited
		let permissions = message.channel.permissionsFor(Discord.bot.user);

		if (permissions.has('SEND_MESSAGES'))
		{
			options.embeds = permissions.has('EMBED_LINKS');
			options.reactions = permissions.has('ADD_REACTIONS');
			options.files = permissions.has('ATTACH_FILES');
		}
		else
		{
			try
			{
				// Uh oh, we can't send messages in this channel, redirect to the user's DM
				options.channel = message.author.dmChannel || await message.author.createDM();
				options.redirected = true;
			}
			catch(err)
			{
				// What do we do if we couldn't create a DM channel?
				console.warn('Unable to create DM channel for ' + message.author.tag, err);
				return;
			}
		}
	}

	// Parse parameters
	let parser = cmd.params.parser || twistybot.parsers.comma_separated;
	// Extract the parameters without command name
	let raw_params = content.slice(match[0].length).trim();
	let parsed_params = parser(raw_params);

	// Check parameters
	let params_valid = true;
	if (cmd.params.min && parsed_params.length < cmd.params.min) { params_valid = false; }
	if (cmd.params.max && parsed_params.length > cmd.params.max) { params_valid = false; }
	if (cmd.params.check && !cmd.params.check(parsed_params)) { params_valid = false; }
	if (!params_valid)
	{
		// TODO: Send an help message explaining how to use the command
		twistybot.send_response(Discord.code_block(twistybot.helptext(options.name, options)), options);
		return;
	}

	// statistics
	//   commands[cmd.name]
	//     count
	//     time

	// Load user preferences
	options.user = twistybot.cache.user.get(message.author.id);

	options.channel.startTyping();

	try
	{
		let response = await cmd.run(parsed_params, options);
		await twistybot.send_response(response, options);
	}
	catch(err)
	{
		// Something terrible happened
		console.warn(err.stack);
		// No await here, just let unhandledRejection catch it
		twistybot.send_response(Discord.code_block('An error occurred while running the command:\n' + err.message), options);
	}

	// Always stop typing
	options.channel.stopTyping();
});

twistybot.cache.init()
	.then( () => Discord.bot.login(config.get('token')) )
	.catch( err => console.error(err.message) );
