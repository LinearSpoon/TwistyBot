module.exports.help = {
	name: 'cb',
	text: 'Display OldSchool player combat stats.',
	category: 'RuneScape'
};
module.exports.permissions = [
	{ user: '*' }
];
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !cb <username>

Examples:
!cb Twisty Fork
!cb Vegakargdon`
};

var Table = require('cli-table2');

module.exports.command = async function(message, params) {
	var stats = await apis.RuneScape.lookup_player(params[0], { priority: 1 });
	if (!stats)
		return Discord.code_block('Player not found.');

	var table = Table.new();

	table.push(
		Table.headers('Stat', 'Level', 'Next'),
		[
			// Stat
			Table.strings(['Combat', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer', 'Magic']),
			// Level
			Table.ints([
				Math.floor(apis.RuneScape.combat_level(stats)),
				stats.attack.level,
				stats.defense.level,
				stats.strength.level,
				stats.hitpoints.level,
				stats.ranged.level,
				stats.prayer.level,
				stats.magic.level
			]),
			// Next
			Table.ints([
				'-',
				find_next_cb_level(stats, 'attack'),
				find_next_cb_level(stats, 'defence'),
				find_next_cb_level(stats, 'strength'),
				find_next_cb_level(stats, 'hitpoints'),
				find_next_cb_level(stats, 'ranged'),
				find_next_cb_level(stats, 'prayer'),
				find_next_cb_level(stats, 'magic'),
			])
		]
	);

	return Discord.code_block(table.toString());
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
