const Discord = require('discord.js');

module.exports = async function(client, message, params) {
	if (params.length == 0)
		throw Error('Usage: !rsof <username>\n\nExamples:\n' +
			'!rsof Sin Dragon\n' +
			'!price Zeale\n');
	var details = await apis.RuneScape.forum_profile(params[0])
	if (details.length == 0)
		return util.dm.code_block('No posts found');

	var e = new Discord.RichEmbed();
	e.setColor(0x87CEEB);
	e.setAuthor('Player: ' + details.name, details.avatar, details.profile);
	for(var i = 0; i < details.length && i < 10; i++)
	{ // section, thread, date, thread_link, showuser_link
		e.addField(details[i].section, '[' + util.approximate_time(details[i].date, Date.now()) + ' ago] [' + details[i].thread + '](' + details[i].showuser_link + ')');
	}

	message.channel.sendEmbed(e);
}
