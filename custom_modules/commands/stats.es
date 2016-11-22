module.exports = async function(params) {
	if (params.length != 1)
	{
		throw Error('Usage: !stats <username>\n\nExamples:'
			+ '\n!stats Twisty Fork'
			+ '\n!stats Vegakargdon');
	}

	var stats = await apis.RuneScape.lookup_player(params[0]);
	if (!stats)
		throw Error('Player not found.');

	var table_header = ['Skill', 'Rank', 'Level', 'XP'];
	var table_data = []
	for(var skill of apis.RuneScape.skills)
	{
		table_data.push([
			skill.charAt(0).toUpperCase() + skill.slice(1), // Capitalize first letter
			stats[skill].rank,
			stats[skill].level,
			util.format_number(stats[skill].xp)
		]);
	}

	return util.dm.table(table_data, [14, 8, 6, 13], ['left', 'right', 'right', 'right'], table_header);
};
