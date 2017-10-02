module.exports.params = {
	max: 1
};

module.exports.run = async function(Discord, client, params, options) {
	// One parameter is a specific command to get help for
	if (params.length == 1)
	{
		let name = params[0].toLowerCase();
		let command = client.commands_by_name[name];

		if (!command)
			return Discord.code_block(name + ' is not a command!');

		let help = command.helptext(options.prefix);
		return help || Discord.code_block(name + ' has no help information!');
	}


	// Filter out commands that the user can't use
	let accessible = {}; // arrays of accessible commands indexed by category
	let longest = 0; // length of the longest command name in this category

	for(let category in client.commands_by_category)
	{
		accessible[category] = [];
		for(let command of client.commands_by_category[category])
		{
			// Skip commands without help properties
			if (!command.help)
				continue;

			// Check if user can use this command.
			if (await command.check_permission(options.message))
			{
				accessible[category].push(command);
				longest = Math.max(command.name.length, longest);
			}
		}
	}

	// Build help text response
	let help = 'Command specific help can be seen with ' + options.prefix + 'help <command>';
	for(let category in client.commands_by_category)
	{
		// Sort alphabetically and append the help text
		if (accessible[category].length > 0)
		{
			let padlen = longest + 2;
			help += '\n\n' + category + ':\n';
			help += Discord.code_block(
				accessible[category]
					.sort( (a,b) => b.name < a.name )
					.map( cmd => options.prefix + cmd.name + ' '.repeat(padlen-cmd.name.length) + cmd.help.description )
					.join('\n')
			);
		}
	}

	return help;
};
