module.exports.help = {
	name: 'ids',
	text: 'Retrieve ids.',
	category: 'Admin'
};
module.exports.params = {
	min: 1,
	max: 2,
	help:
`Usage:
!ids roles
!ids channels, [channel_name]
!ids guilds
!ids user, <username>
`
};

module.exports.permissions = [];

module.exports.command = async function(message, params) {
	if (params[0] == 'roles')
	{
		// List all roles in current guild
		if (!message.channel.guild)
			return Discord.code_block('Only available in guild channels.');
		var roles = message.channel.guild.roles.array();
		return Discord.code_block(roles.map(r => util.printf('%-18s %18s', r.name, r.id)).join('\n'));
	}

	if (params[0] == 'channels')
	{
		var channels = Discord.bot.channels.array();

		if (!params[1])
			channels = channels.filter( c => c.type != 'voice' );
		else
			channels = channels.filter( c => c.type != 'voice' && c.get_name().toLowerCase().indexOf(params[1].toLowerCase()) > -1 );

		if (channels.length == 0)
			return Discord.code_block('No matching channels.');

		return 'Total: ' + channels.length + Discord.code_block(channels.map(c => util.printf('%-30s %18s', c.get_name(), c.id)).join('\n'));
	}

	if (params[0] == 'guilds')
	{
		var guilds = Discord.bot.guilds.array();
		return 'Total: ' + guilds.length + Discord.code_block(guilds.map(g => util.printf('%-24s %18s', g.name, g.id)).join('\n'));
	}

	if (params[0] == 'user')
	{
		if (params[1])
		{
			var user = Discord.bot.get_user(params[1]);
			if (!user)
				return Discord.code_block('User not found.');
			var member = message.channel.guild.members.get(user.id);
			if (!member)
				return Discord.code_block('User id: ' + user.id);

			var roles = member.roles.array();
			return Discord.code_block('User id: ' + user.id + '\n\n' +
				roles.map(r => util.printf('%-18s %18s', r.name, r.id)).join('\n'));
		}

		if (!message.channel.guild)
			return Discord.code_block('Only available in guild channels.');
	}

	if (params[0] == 'members')
	{
		var members = message.guild.members.array();
		return Discord.code_block(members.length + '/' + message.guild.memberCount + '\n'
			+ message.member.user.username
		);
	}

};
