module.exports.help = {
	name: 'nameof',
	text: 'Retrieve names from ids.',
	category: 'General'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !nameof <id>

Notes:
This command returns names of users, guilds, channels, and roles. Message IDs are not recognized.
This command only returns names of resources that the bot is connected to. It is not a global search.`
};

module.exports.permissions = [
	{ user: '*' }
];

var Table = require('cli-table2');
module.exports.command = async function(client, message, params) {
	var table = Table.new();
	table.push( Table.headers('Type', 'Name', 'ID') );

	var id = params[0];

	var user = client.users.get(id);
	if (user)
	{
		var names = user.username + '#' + user.discriminator;
		if (message.channel.guild)
		{ // See if this user is in the same guild and get his nickname
			var member = message.channel.guild.members.get(id);
			if (member && member.nickname)
				names += '\nAKA: ' + member.nickname;
		}
		table.push(['User', names, id ]);
		return Discord.code_block(table.toString());
	}

	var guild = client.guilds.get(id);
	if (guild)
	{
		table.push(['Server', guild.name, id]);
		return Discord.code_block(table.toString());
	}

	var channel = client.channels.get(id);
	if (channel)
	{
		table.push([channel.type[0].toUpperCase() + channel.type.substr(1) + ' Channel', channel.get_name(), id]);
		return Discord.code_block(table.toString());
	}

	if (message.channel.guild)
	{
		var role = message.channel.guild.roles.get(id);
		if (role)
		{
			table.push(['Role', role.name, id]);
			return Discord.code_block(table.toString());
		}
	}

	return Discord.code_block('Not found!');
};
