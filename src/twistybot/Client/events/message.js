module.exports = function(message) {
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
		prefix: this.default_prefix,
		// Response type permissions (does the channel support text, embeds, etc?)
		text: true,
		embeds: true,
		files: true,
		reactions: true,
	};

	if (message.guild)
	{
		// Override the default prefix with the guild's preference
		options.prefix = message.guild.settings.get('cmd_prefix', options.prefix);
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
	let cmd = this.commands_by_name[options.name];
	if (!cmd)
		return; // Not a real command

	// let allowed = twistybot.check_permission(
	// 	message,
	// 	// Global rules
	// 	config.get('global_permissions'),
	// 	// Command specific rules
	// 	cmd.permissions
	// 	// TODO: Guild leader rules
	//
	// 	// Default allow
	// );
	//
	// if (!allowed)
	// {
	// 	console.log('Blocked ' + options.name);
	// 	return;
	// }
	//
	// // Determine where the reply will be sent and what features we can use in the response
	// if (message.guild)
	// {
	// 	// In guilds, our permissions may be limited
	// 	let permissions = message.channel.permissionsFor(Discord.bot.user);
	//
	// 	if (permissions.has('SEND_MESSAGES'))
	// 	{
	// 		options.embeds = permissions.has('EMBED_LINKS');
	// 		options.reactions = permissions.has('ADD_REACTIONS');
	// 		options.files = permissions.has('ATTACH_FILES');
	// 	}
	// 	else
	// 	{
	// 		try
	// 		{
	// 			// Uh oh, we can't send messages in this channel, redirect to the user's DM
	// 			options.channel = message.author.dmChannel || await message.author.createDM();
	// 			options.redirected = true;
	// 		}
	// 		catch(err)
	// 		{
	// 			// What do we do if we couldn't create a DM channel?
	// 			console.warn('Unable to create DM channel for ' + message.author.tag, err);
	// 			return;
	// 		}
	// 	}
	// }
	//
	// // Parse parameters
	// let parser = cmd.params.parser || twistybot.parsers.comma_separated;
	// // Extract the parameters without command name
	// let raw_params = content.slice(match[0].length).trim();
	// let parsed_params = parser(raw_params);
	//
	// // Check parameters
	// let params_valid = true;
	// if (cmd.params.min && parsed_params.length < cmd.params.min) { params_valid = false; }
	// if (cmd.params.max && parsed_params.length > cmd.params.max) { params_valid = false; }
	// if (cmd.params.check && !cmd.params.check(parsed_params)) { params_valid = false; }
	// if (!params_valid)
	// {
	// 	// TODO: Send an help message explaining how to use the command
	// 	twistybot.send_response(Discord.code_block(twistybot.helptext(options.name, options)), options);
	// 	return;
	// }
	//
	// // statistics
	// //   commands[cmd.name]
	// //     count
	// //     time
	//
	// // Load user preferences
	// options.user = twistybot.cache.user.get(message.author.id);
	//
	// options.channel.startTyping();
	//
	// try
	// {
	// 	let response = await cmd.run(parsed_params, options);
	// 	await twistybot.send_response(response, options);
	// }
	// catch(err)
	// {
	// 	// Something terrible happened
	// 	console.warn(err.stack);
	// 	// No await here, just let unhandledRejection catch it
	// 	twistybot.send_response(Discord.code_block('An error occurred while running the command:\n' + err.message), options);
	// }
	//
	// // Always stop typing
	// options.channel.stopTyping();
};