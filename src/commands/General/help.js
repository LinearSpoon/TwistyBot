module.exports.params = {
	max: 1
};

module.exports.aliases = [ 'commands' ];

module.exports.run = async function(Discord, client, params, options) {
	// One parameter is a specific command to get help for
	if (params.length == 1)
	{
		let name = params[0];
		let command = client.get_command(name);

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

	let table = new Discord.Table(2);
	table.borders = false;
	table.min_width(longest + options.prefix.length, 1);
	table.align('ll');

	for(let category in client.commands_by_category)
	{
		// If there are any accessible commands in this category...
		if (accessible[category].length > 0)
		{
			// Sort alphabetically by command name
			accessible[category].sort( (a,b) => b.name < a.name );
			// Add commands to table
			accessible[category].forEach(cmd => table.push(options.prefix + cmd.name, cmd.help.description));
			// Append category to help response
			help += '\n' + category + ':' + Discord.code_block(table.toString());
			// Reset table for next category
			table.empty();
		}
	}

	return help;
};
