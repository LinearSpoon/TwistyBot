let Discord = require('discord.js');

module.exports = async function(message) {
	console.log(`[New] [${ message.channel.friendly_name }] ${ message.author.username }: ${ message.string_content }`);

	if (message.author.id == this.user.id)
		return; // Ignore own messages

	// Default options
	let options = {
		// Received message
		message: message,
		// Output channel, where the command response is to be sent
		channel: message.channel,
		// Command name
		name: null,
		// Command prefix
		prefix: this.prefix,
		// Response type permissions (does the channel support text, embeds, etc?)
		text: true,
		embeds: true,
		files: true,
		reactions: true,
	};

	if (message.guild)
	{
		// Override the default prefix with the guild's preference
		options.prefix = await message.guild.config.get('prefix') || options.prefix;
	}

	// Does the message start with the prefix?
	let content = message.content;
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
	let command = this.commands_by_name[options.name];
	if (!command)
		return; // Not a real command

	// Invisible members are not always available in large guilds (250+ members?)
	// https://github.com/hydrabolt/discord.js/issues/1165
	// Explicitly fetch their profile if it isn't defined
	if (message.type == 'text' && !message.member)
	{
		message.member = await message.guild.members.fetch(message.author);
	}

	if (!await command.check_permission(message))
	{
		console.log('Blocked ' + options.name);
		return;
	}

	// TODO: save recent commands?

	// Determine where the reply will be sent and what features we can use in the response
	if (message.guild)
	{
		// In guilds, our permissions may be limited
		let permissions = message.channel.permissionsFor(this.user);

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

	// Choose a parser
	let parser;
	if (typeof command.params.parser === 'string')
		parser = this.parsers[command.params.parser];
	if (typeof command.params.parser === 'function')
		parser = command.params.parser;
	parser = parser || this.parsers.comma_separated;

	// Extract the parameters without command name
	let raw_params = content.slice(match[0].length).trim();
	let parsed_params = parser(raw_params);

	// Check parameters
	let params_valid = true;
	if (command.params.min && parsed_params.length < command.params.min) { params_valid = false; }
	if (command.params.max && parsed_params.length > command.params.max) { params_valid = false; }

	// Don't call check function if the number of parameters is wrong
	if (params_valid && command.params.check && !command.params.check(parsed_params)) { params_valid = false; }
	if (!params_valid)
	{
		// Send an help message explaining how to use the command
		this.send_response(command.helptext(options.prefix), options);
		return;
	}

	// TODO: statistics
	//   commands[cmd.name]
	//     count
	//     time

	options.channel.startTyping();

	try
	{
		let response = await command.run(Discord, this, parsed_params, options);
		await this.send_response(response, options);
	}
	catch(err)
	{
		// Something terrible happened
		console.warn(err.stack);
		// No await here, just let unhandledRejection catch it
		this.send_response(Discord.code_block('An error occurred while running the command:\n' + err.message), options);
	}

	// Always stop typing
	options.channel.stopTyping();
};
