module.exports.help = {
	name: 'idof',
	text: 'Retrieve ids from names.',
	category: 'General'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !idof <resource name>

Resource name can be:
* ServerName
* ServerName.ChannelName
* DM.Username#1234
	This does not retrieve your DM channel with that user, it retrieves the bot's DM channel with that user.
* Username#1234
	The discriminator is optional.
* Nickname
	This only searches nicknames in the server that the command was sent in.
* RoleName
	This only searches roles in the server that the command was sent in.

Notes:
This command only returns ids of resources that the bot is connected to. It is not a global search.
`
};

module.exports.permissions = [
	{ user: '*' }
];

var Table = require('cli-table2');
module.exports.command = async function(message, params) {
	// \u200B == zero width space (sometimes present in mentions?)
	var name = params[0].replace(/\u200B/,'').toLowerCase();

	var users = Discord.bot.users.array().filter(function(user) {
		return name == user.username.toLowerCase()
			|| name == (user.username.toLowerCase() + '#' + user.discriminator);
	});

	var guilds = Discord.bot.guilds.array().filter(guild => guild.name.toLowerCase() == name);
	var channels = Discord.bot.channels.array().filter(function(channel) {
		if (channel.type == 'dm')
			return name == ('dm.' + channel.recipient.username.toLowerCase()) ||
				name == ('dm.' + channel.recipient.username.toLowerCase() + '#' + channel.recipient.discriminator);
		if (channel.type == 'text' || channel.type == 'voice')
			return name == channel.guild.name.toLowerCase() + '.' + channel.name.toLowerCase();
	});

	var roles = [];
	var members = [];
	if (message.channel.guild)
	{
		roles = message.channel.guild.roles.array().filter(role => role.name.toLowerCase() == name );
		members = message.channel.guild.members.array().filter(member => member.nickname && member.nickname.toLowerCase() == name);
	}

	var table = Table.new();
	table.push( Table.headers('Type', 'Name', 'ID') );
	function push_arr(arr, type, name_fn)
	{
		if (arr.length == 0)
			return;
		table.push([
			Table.strings(arr.map(typeof type == 'function' ? type : e => type)),
			Table.strings(arr.map(name_fn)),
			Table.strings(arr.map(e => e.id))
		]);
	}

	push_arr(users, 'User', u => u.username + '#' + u.discriminator);
	push_arr(guilds, 'Server', g => g.name);
	push_arr(channels, c => c.type[0].toUpperCase() + c.type.substr(1) + ' Channel', c => c.get_name());
	push_arr(roles, 'Role', r => r.name);
	push_arr(members, 'User', m => m.nickname);

	if (table.length == 1)
		return Discord.code_block('Not found!');
	return Discord.code_block(table.toString());
};
