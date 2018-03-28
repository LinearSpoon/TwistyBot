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
	let match = content.match(/^([a-zA-Z_]+) *,?/);
	if (!match)
		return; // Couldn't parse

	// Save command name
	options.name = match[1];

	// Is this a real command?
	let command = this.get_command(options.name);
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

	// Run the command
	let response = await command.execute(content.slice(match[0].length), options);

	// Try sending the response
	try
	{
		await this.send_response(response, options);
	}
	catch(err)
	{
		this.log_error(err, options.message);
	}
};
