module.exports.help = {
	name: 'rsof',
	text: 'Display OldSchool player forum profile.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 50,
	help:
`Usage: !rsof <username>, <username>, ...

Note:
If you see a blank message from this command, you may have embeds disabled. Enable them at Settings->Text & Images->Link Preview.

Examples:
!rsof Sin Dragon
!rsof Zeale`
};
module.exports.permissions = [];

module.exports.command = async function(message, params) {
	var embeds = params.map(async function(param) {
		var details = await apis.RuneScape.forum_profile(param, { priority: 1 })
		if (details.length == 0)
			return Discord.code_block('No posts found for ' + param);

		var e = new Discord.RichEmbed();
		e.setColor(0x87CEEB);
		e.setAuthor('Player: ' + details.name, details.avatar, details.profile);
		for(var i = 0; i < details.length && i < 10; i++)
		{ // section, thread, date, thread_link, showuser_link
			e.addField(details[i].section, '[' + util.approximate_time(details[i].date, Date.now()) + ' ago] [' + details[i].thread + '](' + details[i].showuser_link + ')');
		}

		return e;
	});
	return await Promise.all(embeds);
}
