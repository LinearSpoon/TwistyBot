module.exports.help = {
	name: 'examine',
	text: 'View internal data.',
	category: 'Admin'
};
module.exports.params = {
	min: 0,
	max: 999,
	help:
`Usage: !examine

Examples:
!examine client
!examine guild, <guild name or id>`
};

module.exports.permissions = [];

module.exports.command = async function(message, params) {
	if (params[0] == 'client')
		return Discord.json(examine_client());

	if (params[0] == 'guild')
	{
		let guild = params.length == 1 ? message.guild : find_guild(params[1]);
		if (guild)
			return Discord.json(examine_guild(guild));
	}

	if (params[0] == 'channel')
	{
		let channel = params.length == 1 ? message.channel : find_channel(params[1]);
		if (channel)
			return Discord.json(examine_channel(channel));
	}

	if (params[0] == 'permission')
	{
		let user = params.length == 1 ? message.author : find_user(params[1]);
		let channel = params.length == 3 ? find_channel(params[2]) : message.channel;
		if (user && channel && (channel.type == 'text' || channel.type == 'voice'))
		{
			return Discord.json(channel.permissionsFor(user).serialize(true));
		}

	}

	return Discord.code_block('Not found!');
};


function find_guild(name)
{
	let target = name.toLowerCase();
	return Discord.bot.guilds.find( guild => guild.id == target || guild.name.toLowerCase() == target );
}

function find_channel(name)
{
	let target = name.toLowerCase();
	return Discord.bot.channels.find(function(channel) {
		// Match channel id
		if (channel.id == target)
			return true;

		// Or guildname.channelname
		if (channel.type == 'voice' || channel.type == 'text')
		{
			return target == channel.guild.name.toLowerCase() + '.' + channel.name.toLowerCase();
		}

		// Or DM.username[#discriminator]
		if (channel.type == 'dm')
		{
			let short_name = 'dm.' + channel.recipient.username.toLowerCase();
			let full_name = short_name + '#' + channel.recipient.discriminator;
			return target == short_name || target == full_name;
		}

		// For now, don't care about group channels
		return false;
	});
}

function find_user(name)
{
	let target = name.toLowerCase();
	return Discord.bot.users.find( user => user.id == target || user.username.toLowerCase() == target || user.tag.toLowerCase() == target);
}

function examine_client()
{
	let bot = Discord.bot;
	return {
		name: bot.user.tag,
		id: bot.user.id,
		guilds_cached: bot.guilds.size,
		channels_cached: bot.channels.size,
		users_cached: bot.users.size,
		ping: bot.ping,
		status: bot.status,
		ready_at: bot.readyAt,
		uptime: util.approximate_time(bot.readyTimestamp, Date.now()),
	};
}

function examine_guild(guild)
{
	return {
		name: guild.name,
		id: guild.id,
		owner: guild.owner.user.tag,
		available: guild.available,
		member_for: util.approximate_time(guild.joinedTimestamp, Date.now()),
		member_count: guild.memberCount,
		features: guild.features,
		text_channels: guild.channels
			.filter(channel => channel.type == 'text')
			.map(function(channel) {
				return {
					name: channel.name,
					id: channel.id
				};
			}),
		voice_channels: guild.channels
			.filter(channel => channel.type == 'voice')
			.map(function(channel) {
				return {
					name: channel.name,
					id: channel.id,
				};
			}),
	};
}

function examine_channel(channel)
{
	if (channel.type == 'text')
	{
		return {
			type: 'text',
			name: channel.guild.name + '.' + channel.name,
			id: channel.id,
			topic: channel.topic ? channel.topic : undefined
		};
	}
	else if (channel.type == 'dm')
	{
		return {
			type: 'dm',
			recipient: channel.recipient.tag,
			id: channel.id
		};
	}
	else if (channel.type == 'group')
	{
		return{
			type: 'group',
			recipients: channel.recipients.map( user => user.tag ),
			id: channel.id
		};
	}
	else if (channel.type == 'voice')
	{
		return {
			type: 'voice',
			name: channel.guild.name + '.' + channel.name,
			id: channel.id
		};
	}
}
