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
module.exports.whitelist = null;

module.exports.command = async function(client, message, params) {
	var name = params[0];
	var include_private = util.message_in(message, 'rsj_private_channels');

	var players = await apis.RSJustice.lookup(name, include_private);
	if (players.length == 0)
	{
		return 'Player not found! Here are some similar names:\n' +
			util.dm.code_block(
				'Name               Score\n' +
				apis.RSJustice.get_similar_names(name, include_private).map(e => util.printf('%-18s %5d', e.name, e.score)).join('\n')
			);
	}

	for(var i = 0; i < players.length; i++)
		send_embed(message, players[i]);
};

function send_embed(message, details)
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

	if (util.message_in(message, 'admin_channels'))
	{
		e.addField('Status:', details.status, true);
		e.addField('ID:', details.id, true);
	}
	return message.channel.sendEmbed(e);
}
