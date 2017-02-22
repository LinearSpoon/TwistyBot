const Discord = require('discord.js');

module.exports.help = {
	name: 'rsof',
	text: 'Display OldSchool player forum profile.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !rsof <username>

Examples:
!rsof Sin Dragon
!rsof Zeale`
};
module.exports.permissions = [];

module.exports.command = async function(client, message, params) {
	var details = await apis.RuneScape.forum_profile(params[0], { priority: 1 })
	if (details.length == 0)
		return Discord.code_block('No posts found');

	var e = new Discord.RichEmbed();
	e.setColor(0x87CEEB);
	e.setAuthor('Player: ' + details.name, details.avatar, details.profile);
	for(var i = 0; i < details.length && i < 10; i++)
	{ // section, thread, date, thread_link, showuser_link
		e.addField(details[i].section, '[' + util.approximate_time(details[i].date, Date.now()) + ' ago] [' + details[i].thread + '](' + details[i].showuser_link + ')');
	}

	message.channel.sendEmbed(e);
}
