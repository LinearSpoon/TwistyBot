module.exports.help = {
	name: 'ehp',
	text: 'Check efficient training hours earned.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !ehp <username>

Note:
This command implements the same time to max calculations as found on CyrstalMathLabs, but no longer gets the data from their site.
There is a small chance the results will be different, if CML updates their algorithm due to a new update, etc.

Examples:
!ehp Twisty Fork
!ehp Vegakargdon`
};

module.exports.permissions = [
	{ user: '*' }
];

module.exports.command = async function(message, params) {
	var stats = await apis.RuneScape.lookup_player(params[0], { priority: 1 });
	if (!stats)
		return Discord.code_block('Player not found.');

	var max_ehp = apis.RuneScape.max_ehp;
	var hours = apis.RuneScape.calculate_time(apis.RuneScape.skills.map( i => stats[i].xp ), 200000000);

	return Discord.code_block(util.format_number(max_ehp.overall - hours.overall,2) + ' hours');
};
