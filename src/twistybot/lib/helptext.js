module.exports = function(command_name, options) {
	let command = twistybot.commands.names[command_name];
	if (!command || !command.help)
		return; // Invalid command name or no help defined

	let help = `Usage: ${ options.prefix }${ command.name } ${ command.help.parameters }`;
	if (command.help.details && command.help.details.length > 0)
		help += '\n\n' + command.help.details;
	return help;
};
