module.exports.params = {
	max: 1
};

module.exports.permissions = [];

let global_permissions = config.get('global_permissions');
module.exports.run = async function(Discord, client, params, options) {
	if (params.length == 1)
	{
		// First parameter is a specific command to get help for
		let command = params[0].toLowerCase();
		if (command == 'help')
			return Discord.code_block('Quit playing around!');

		if (!client.commands_by_name[command])
			return Discord.code_block(command + ' is not a command!');

		let help = client.help_text(command, options);
		return Discord.code_block(help || (command + ' has no help information!'));
	}


	// Filter out commands that the user can't use
	let accessible = {}; // arrays of accessible commands indexed by category
	let longest = 0; // length of the longest command name in this category

	for(let category in client.commands_by_category)
	{

		accessible[category] = [];
		for(let cmd of client.commands_by_category[category])
		{
			// Skip commands without help properties
			if (!cmd.help)
				continue;

			// Check if user can use this command
			let allowed = client.check_permission(
				options.message,
				global_permissions,
				cmd.permissions
				// TODO: Guild leader rules
			);


			if (allowed)
			{
				accessible[category].push(cmd);
				longest = Math.max(cmd.name.length, longest);
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
