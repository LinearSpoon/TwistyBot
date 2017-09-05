module.exports.params = {
	max: 1
};

module.exports.permissions = [];

module.exports.run = async function(params, options) {
	// Note: Because this file is loaded by commands, we should wait until runtime to require it
	let commands = src_require('commands');
	let global_permissions = config.get('global_permissions');

	// Build a listing of commands this user can access
	let help = 'Command specific help can be seen with ' + options.prefix + 'help <command>';
	for(let category in commands.categories)
	{
		let accessible = [];
		for(let cmd of commands.categories[category])
		{
			// If help properties are not defined, skip it
			if (!cmd.help)
				continue;

			// Check if user can use this command
			// TODO: Guild leader rules
			if (options.message.check_permission(global_permissions, cmd.permissions))
			{
				accessible.push(cmd);
			}
		}

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
