module.exports.help = {
	name: 'roles',
	text: 'Display guild roles and ids.',
	category: 'Admin'
};
module.exports.whitelist = null;
module.exports.params = {
	min: 0,
	max: 1,
	help: `Usage: !roles`
};

module.exports.permissions = [];

module.exports.command = async function(client, message, params) {
	if (!message.channel.guild)
		return Discord.code_block('Only available in guilds.');

	if (params.length == 0)
	{ // List all roles in guild
		var roles = Array.from(message.channel.guild.roles.values())
		return Discord.code_block(roles.map(role => util.printf('%-16s %18s', role.name, role.id)).join('\n'));
	}

	// Else, list roles of the username passed in
	var member = message.guild.members.find(m => m.displayName.toLowerCase() == params[0].toLowerCase());
	if (!member)
		return Discord.code_block("Couldn't find that member in this guild.");
	var roles = Array.from(member.roles.values());
	return Discord.code_block(roles.map(role => util.printf('%-18s %18s', role.name, role.id)).join('\n'));

};
