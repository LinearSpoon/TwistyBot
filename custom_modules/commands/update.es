module.exports.help = {
	name: 'update',
	text: 'Updates a single player on CrystalMathLabs.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !update <username>

Examples:
!update Twisty Fork
!update Vegakargdon`
};
module.exports.whitelist = null;

module.exports.command = async function(client, message, params) {
	await apis.CrystalMathLabs.update_player(params[0]);
	return util.dm.code_block('Player successfully updated!');
};
