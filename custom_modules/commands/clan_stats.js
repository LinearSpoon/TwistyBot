var get_clan_list = custom_require('report/sources/clan_list');

module.exports.help = {
	name: 'clan_stats',
	text: 'Search clan stats.',
	category: 'Deities'
};
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !clan_stats`
};
module.exports.permissions = [];

module.exports.command = async function(message, params) {
	var clan_list = await load_report_data();
	var under1 = [];

	for(var i in clan_list)
	{
		var member = clan_list[i];
		console.log(member.history.length);
		if (member.history.length == 0)
			continue;

		var hs = member.history[0].skills;
		if (apis.RuneScape.combat_level(hs) < 120) under1.push(member);
		if (hs.overall.level < 1500) under_1500_total.push(member);
		if (hs.agility.level < 70) under_70_agil.push(member);
		if (hs.ranged.level < 75) under_75_range.push(member);
		if (hs.magic.level < 75) under_75_magic.push(member);
	}

	message.channel.sendmsg('Under 120 total:' + Discord.code_block(
		under1.map(m =>
			util.printf('%12s   %4s', m.name, apis.RuneScape.combat_level(m.history[0].skills))
		).join('\n')
	));
	//
	// message.channel.sendmsg('Under 1500 total:' + Discord.code_block(
	// 	under_1500_total.map(m =>
	// 		util.printf('%12s   %4s', m.name, m.history[0].hiscores.overall.level)
	// 	).join('\n')
	// ));
	//
	// message.channel.sendmsg('Under 70 agility:' + Discord.code_block(
	// 	under_70_agil.map(m =>
	// 		util.printf('%12s   %4s', m.name, m.history[0].hiscores.agility.level)
	// 	).join('\n')
	// ));
	//
	// message.channel.sendmsg('Under 75 range:' + Discord.code_block(
	// 	under_75_range.map(m =>
	// 		util.printf('%12s   %4s', m.name, m.history[0].hiscores.ranged.level)
	// 	).join('\n')
	// ));
	//
	// message.channel.sendmsg('Under 75 magic:' + Discord.code_block(
	// 	under_75_magic.map(m =>
	// 		util.printf('%12s   %4s', m.name, m.history[0].hiscores.magic.level)
	// 	).join('\n')
	// ));
	//
	// message.channel.sendmsg('Unique:' + Discord.code_block(
	// 	under_1500_total.concat(under_70_agil, under_75_range, under_75_magic)
	// 		.filter(onlyUnique).map(m => m.name).join('\n')
	// 	));
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

async function load_report_data()
{
	var report = await util.load_json_file(global.server_directory + '/storage/latest_report.json', []);
	for(var i = 0; i < report.clan_list.length; i++)
	{
		var member = report.clan_list[i];
		member.history = await apis.Spoon.load_player_exp_history(member.name);
	}
	return report.clan_list;
}
