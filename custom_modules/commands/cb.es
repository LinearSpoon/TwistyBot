const fmt = '%-10s %7d %7s\n';

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

	return util.dm.code_block(
		'Stat         Level    Next\n' +
		util.printf(fmt, 'Combat:', apis.RuneScape.combat_level(stats), '-') +
		util.printf(fmt, 'Attack:', stats.attack.level, find_next_cb_level(stats, 'attack')) +
		util.printf(fmt, 'Defense:', stats.defense.level, find_next_cb_level(stats, 'defense')) +
		util.printf(fmt, 'Strength:', stats.strength.level, find_next_cb_level(stats, 'strength')) +
		util.printf(fmt, 'Hitpoints:', stats.hitpoints.level, find_next_cb_level(stats, 'hitpoints')) +
		util.printf(fmt, 'Ranged:', stats.ranged.level, find_next_cb_level(stats, 'ranged')) +
		util.printf(fmt, 'Prayer:', stats.prayer.level, find_next_cb_level(stats, 'prayer')) +
		util.printf(fmt, 'Magic:', stats.magic.level, find_next_cb_level(stats, 'magic'))
	);
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
