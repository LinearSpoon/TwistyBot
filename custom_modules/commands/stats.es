module.exports.help = {
	name: 'stats',
	text: 'Display OldSchool player stats.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !stats <username>

Examples:
!stats Twisty Fork
!stats Vegakargdon`
};
module.exports.permissions = [
	{ user: '*' }
];

module.exports.command = async function(client, message, params) {
	var stats = await apis.RuneScape.lookup_player(params[0], { priority: 1 });
	if (!stats)
		return Discord.code_block('Player not found.');

	var output = 'Skill               Rank  Level            XP';
	var table_data = []
	for(var skill of apis.RuneScape.skills)
	{
		var unranked = stats[skill].rank == -1;
		if (unranked)
		{
			output += util.printf('\n%-12s %11s %6s %13s', skill.charAt(0).toUpperCase() + skill.slice(1), '-', '-', '-');
		}
		else
		{
			output += util.printf('\n%-12s %11s %6s %13s',
				skill.charAt(0).toUpperCase() + skill.slice(1), // Capitalize first letter
				stats[skill].rank,
				stats[skill].level,
				util.format_number(stats[skill].xp));
		}
	}

	return Discord.code_block(output);
};
