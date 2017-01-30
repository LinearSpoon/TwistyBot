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
module.exports.whitelist = null;

module.exports.command = async function(client, message, params) {
	var hours = await apis.CrystalMathLabs.time_to_max(params[0]);
	return util.dm.code_block(hours + ' hours');
};
