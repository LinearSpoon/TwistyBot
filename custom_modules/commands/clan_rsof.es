var get_clan_list = custom_require('report/sources/clan_list');

module.exports.help = {
	name: 'clan_rsof',
	text: 'Search clan rsof profiles.',
	category: 'Deities'
};
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !clan_rsof`
};
module.exports.permissions = [];

module.exports.command = async function(client, message, params) {
	var clan_list = await get_clan_list();
	var output = '';
	for(var i in clan_list)
	{
		var member = clan_list[i];
		var details = await apis.RuneScape.forum_profile(member.name, { success_delay: 5000, max_attempts: 99 });
		if (details.length == 0)
		{
			console.log('#' + member.id, member.name, 'has no posts.');
			continue; // No posts
		}
		console.log('#' + member.id, member.name, 'checking posts.');
		check_posts(message, member, details);

	}
}

function check_posts(message, member, details)
{
	var e = new Discord.RichEmbed();
	e.setColor(0x87CEEB);
	e.setAuthor('Player: ' + details.name, details.avatar, details.profile);
	for(var j = 0; j < details.length; j++)
	{
		var post = details[j];
		if (post.section == 'Old School Clans')
		{
			if (post.thread.indexOf('Deities of PvM') > -1)
			{
				if (e.fields.length > 0)
					e.addField(post.section, '[' + util.approximate_time(post.date, Date.now()) + ' ago] [' + post.thread + '](' + post.showuser_link + ')');
				break;
			}
			if (post.date > member.accepted)
				e.addField(post.section, '[' + util.approximate_time(post.date, Date.now()) + ' ago] [' + post.thread + '](' + post.showuser_link + ')');
		}
	}

	if (e.fields.length > 0)
		message.channel.sendEmbed(e);
}
