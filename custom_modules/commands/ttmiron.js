module.exports.help = {
	name: 'ttmiron',
	text: 'Check hours to max stats with efficient training for ironman.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !ttmiron <username>

Note:
This command implements the same time to max calculations as found on CyrstalMathLabs, but no longer gets the data from their site.
There is a small chance the results will be different, if CML updates their algorithm due to a new update, etc.

Examples:
!ttm Twisty Fork
!ttm Vegakargdon`
};
module.exports.permissions = [
	{ user: '*' }
];


var Table = require('cli-table2');

module.exports.command = async function(message, params) {
	var stats = await apis.RuneScape.lookup_player(params[0], { priority: 1 });
	if (!stats)
		return Discord.code_block('Player not found.');

	var hours = apis.RuneScape.ehp.iron.calculate(stats, 13034431);

	var table = new Table({colWidths: [15, 15, 10], style:{head:[],border:[]}});

	table.push([ // Header
		Table.cell('Skill', 'center'),
		Table.cell('Experience', 'center'),
		Table.cell('TTM', 'center'),
	]);


	table.push([
		// Skill column
		Table.strings(apis.RuneScape.skills.map(s => s[0].toUpperCase() + s.substr(1))),
		// Experience column
		Table.ints(apis.RuneScape.skills.map(s => stats[s].xp)),
		// TTM column
		Table.floats(apis.RuneScape.skills.map(s => hours[s] == 0 ? '-' : hours[s]))
	]);


	return Discord.code_block(table.toString());
};
