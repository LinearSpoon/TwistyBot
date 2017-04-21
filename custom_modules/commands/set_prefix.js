const Discord = require('discord.js');

module.exports.help = {
	name: 'set_prefix',
	text: 'Set TwistyBot command prefix for this server.',
	category: 'General'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !set_prefix <new_prefix>

Note:
Prefixes are limited to 4 characters.
It is recommended not to use letters, numbers, or underscore in the prefix.
Please remember your new prefix, you will not be able to contact the bot if you lose it!

Examples:
!set_prefix %
!set_prefix $$`
};
module.exports.permissions = [];

module.exports.command = async function(message, params) {
	if (!message.guild)
		return Discord.code_block('Only available in guilds!');

	var new_prefix = params[0].slice(0,4);
	message.set_command_prefix(new_prefix);
	return Discord.code_block('Command prefix set to: ' + new_prefix);;
}
