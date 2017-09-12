module.exports.params = {
	max: 1
};

module.exports.permissions = [];

let global_permissions = config.get('global_permissions');
module.exports.run = async function(params, options) {
	if (params.length == 1)
	{
		// First parameter is a specific command to get help for
		if (params[0].toLowerCase() == 'help')
			return Discord.code_block('Quit playing around!');

		let help = twistybot.helptext(params[0], options);
		return Discord.code_block(help || 'Command not found!');
	}

	// Build a listing of commands this user can access
	let help = 'Command specific help can be seen with ' + options.prefix + 'help <command>';
	for(let category in twistybot.commands.categories)
	{
		let accessible = [];
		for(let cmd of twistybot.commands.categories[category])
		{
			// If help properties are not defined, skip it
			if (!cmd.help)
				continue;

			// Check if user can use this command
			let allowed = twistybot.check_permission(
				options.message,
				global_permissions,
				cmd.permissions
				// TODO: Guild leader rules
			);


			if (allowed)
			{
				accessible.push(cmd);
			}
		}

		// Sort alphabetically and append the help text
		if (accessible.length > 0)
		{
			help += '\n\n' + category + ' commands:\n';
			help += Discord.code_block(accessible
				.sort( (a,b) => b.name < a.name )
				.map( cmd => options.prefix + cmd.name + ' ' + cmd.help.description )
				.join('\n')
			);
		}
	}

	// TODO: Check music channels
	return help;
};