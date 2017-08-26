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
	root_require('config/config')
);

global.managers = src_require('managers');
global.Discord = src_require('discordjs');

/***************************************************************
 *                       Other Data
 ***************************************************************/
let commands = src_require('commands');
let default_parser = src_require('parsers/comma_separated');

/***************************************************************
 *                       Bot events
 ***************************************************************/
Discord.bot.on('ready', function() {
	console.log('[Ready]');
});

Discord.bot.on('disconnect', function(event) {
	console.warn('[Disconnect]', event.code, event.reason);
});

function pretty_message(message)
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

function send_responses(responses, options)
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
	let split_messages = [];

	messages.forEach(function(message) {
		if (message.content.length <= 2000)
			return split_messages.push(message); // The message is already short enough

		// We need to split the content into multiple messages


	});

	// Send the messages
	return Promise.all(split_messages.map( message => options.channel.send(message.content, message.options) ));
}

Discord.bot.on('message', async function(message) {
	console.log('[New]', pretty_message(message));

	if (message.author.id == Discord.bot.user.id)
		return; // Ignore own messages

	// Determine the command prefix for this channel
	let prefix = '!';
	if (message.guild)
	{
		try
		{
			let gsd = await managers.savedata.Discord.load_guild(message.guild.id);
			prefix = gsd.cmd_prefix;
		}
		catch(err)
		{
			console.warn(err.stack);
			prefix = '!';
		}
	}

	// Does it have the prefix?
	let content = message.cleanContent;
	if (!content.startsWith(prefix))
		return; // Prefix not found

	// Remove prefix from message
	content = content.slice(prefix.length);

	// Extract command name
	let match = content.match(/^([a-zA-Z_]+)\s*,?/);
	if (!match)
		return; // Couldn't parse

	// Is this a real command?
	let cmd = commands.names[match[1].toLowerCase()]; // match[1] = command name only
	if (!cmd)
		return; // Not a real command

	let allowed = message.check_permission(
		// Global rules
		config.get('global_permissions'),
		// Command specific rules
		cmd.permissions
		// TODO: Guild leader rules

		// Default allow
	);

	if (!allowed)
	{
		console.log('Command blocked');
		return;
	}

	// Determine where the reply will be sent and what features we can use in the response
	let options = {
		message: message,
		channel: message.channel,
		prefix: prefix,
		text: true,
		embeds: true,
		files: true,
		reactions: true
	};
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
				// Uh oh, we can't send messages, redirect to the user's DM
				options.channel = message.author.dmChannel || await message.author.createDM();
				options.redirected = true;
			}
			catch(err)
			{
				// What do we do if we couldn't create a DM channel?
				console.warn(err);
				return;
			}
		}
	}

	// Parse parameters
	let parser = cmd.params.parser || default_parser;
	// Pass message content without command name to the parser
	let params = parser(content.slice(match[0].length).trim()); // match[0] = command name with optional comma

	// Check parameters
	let params_valid = true;
	if (cmd.params.min && params.length < cmd.params.min) { params_valid = false; }
	if (cmd.params.max && params.length > cmd.params.max) { params_valid = false; }
	if (cmd.params.check && !cmd.params.check(params)) { params_valid = false; }
	if (!params_valid)
	{
		console.log('invalid params');
		// TODO: Send an help message explaining how to use the command
		return;
	}

	// statistics
	//   commands[cmd.name]
	//     count
	//     time

	options.channel.startTyping();

	try
	{
		let response = await cmd.run(params, options);

		// Convert response to format for send
		// Append redirected message
		await options.channel.send(response);
	}
	catch(err)
	{
		// Something terrible happened
		console.warn(err.stack);
		// No await here, just let unhandledRejection catch it
		options.channel.send(Discord.code_block('An error occurred while running the command:\n' + err.message));
	}

	// Always stop typing
	options.channel.stopTyping();

	// Always stop typing

	// start typing
	// run command
	// send response
	// end typing

	// catch errors?
});

Discord.bot.login(config.get('token'));
