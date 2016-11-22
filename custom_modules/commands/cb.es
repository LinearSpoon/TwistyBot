module.exports = async function(params) {
	if (params.length != 1)
	{
		throw Error('Usage: !cb <username>\n\nExamples:'
			+ '\n!cb Twisty Fork'
			+ '\n!cb Vegakargdon');
	}

	var stats = await apis.RuneScape.lookup_player(params[0]);
	if (!stats)
		throw Error('Player not found.');

	var table_data = [
		['Combat:', apis.RuneScape.combat_level(stats), '-'],
		['Attack:', stats.attack.level, find_next_cb_level(stats, 'attack')],
		['Defense:', stats.defense.level, find_next_cb_level(stats, 'defense')],
		['Strength:', stats.strength.level, find_next_cb_level(stats, 'strength')],
		['Hitpoints:', stats.hitpoints.level, find_next_cb_level(stats, 'hitpoints')],
		['Ranged:', stats.ranged.level, find_next_cb_level(stats, 'ranged')],
		['Prayer:', stats.prayer.level, find_next_cb_level(stats, 'prayer')],
		['Magic:', stats.magic.level, find_next_cb_level(stats, 'magic')],
	];

	return util.dm.table(table_data, [10, 7, 7], ['left', 'right', 'right'], ['Stat', 'Level', 'Next']);
};


function find_next_cb_level(stats, skill)
{
	var current_cb = Math.floor(apis.RuneScape.combat_level(stats));
	var current_skill = stats[skill].level;

	// Brute force one level at a time until cb changes
	do {
		stats[skill].level++;
	} while(current_cb == Math.floor(apis.RuneScape.combat_level(stats)));

	// Restore stats object
	var saved_skill = stats[skill].level;
	stats[skill].level = current_skill;
	return saved_skill - current_skill;
}
