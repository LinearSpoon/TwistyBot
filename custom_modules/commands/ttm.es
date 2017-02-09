module.exports.help = {
	name: 'ttm',
	text: 'Check hours to max stats with efficient training.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !ttm <username>

Examples:
!ttm Twisty Fork
!ttm Vegakargdon`
};
module.exports.permissions = [
	{ user: '*' }
];

module.exports.command = async function(client, message, params) {
	try {
		await apis.CrystalMathLabs.update_player(params[0]);
	} catch(e) {
		// Player updated in the last 30 seconds is not a problem
		if (e.code != 5)
			throw e;
	}
	var hours = await apis.CrystalMathLabs.time_to_max(params[0]);
	return Discord.code_block(hours + ' hours');
};
