const Discord = require('discord.js');

module.exports.help = {
	name: 'rsj',
	text: 'Lookup a player on RS Justice.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !rsj <username>

Examples:
!rsj i rep wih
!rsj tades`
};
module.exports.permissions = [
	{ user: '*' }
];

module.exports.command = async function(client, message, params) {
	var Zeal_dm = Discord.bot.get_dm_channel('Zeal#0153');
	var name = params[0];
	var include_private = message.check_permissions([
		{ channel: '266095695860203520' }, // RS JUSTICE.name-checks
		{ channel: '230201497302859776' }, // RS JUSTICE.private
		{ guild: '232274245848137728' }, // Twisty-Test
		{ user: '189803024611278849' }, // Zeal
		{ user: '217934790886686730' }, // Twisty Fork
	]);

	var players = await apis.RSJustice.lookup(name, include_private);
	if (players.length == 0)
	{
		var response = 'Player not found! Here are some similar names:\n' +
			Discord.code_block(
				'Name               Score\n' +
				apis.RSJustice.get_similar_names(name, include_private).map(e => util.printf('%-18s %5d', e.name, e.score)).join('\n')
			);

		Zeal_dm.sendmsg(message.author.username + ': !rsj ' + params[0] + '\n' + response);

		return response;
	}

	for(var i = 0; i < players.length; i++)
	{ // Twisty-Test
		message.channel.sendEmbed(get_embed(players[i], message.channel.guild && message.channel.guild.id == '232274245848137728'));
		Zeal_dm.sendEmbed(get_embed(players[i], true), i == 0 ? message.author.username + ': !rsj ' + params[0] : undefined);
	}

};

function get_embed(details, extra)
{
	var e = new Discord.RichEmbed();
	e.setColor(0x87CEEB);
	e.setAuthor('Current name: ' + details.player);
	e.setDescription(details.reason);
	e.addField('Published:', util.approximate_time(details.date_created, new Date()) + ' ago', true);
	e.addField('Last updated:', util.approximate_time(details.date_modified, new Date()) + ' ago', true);
	e.addField('Link:', details.url);
	if (details.previous_names.length)
		e.addField('Previous names:', details.previous_names.join('\n'));

	if (extra)
	{
		e.addField('Status:', details.status, true);
		e.addField('ID:', details.id, true);
	}
	return e;
}
