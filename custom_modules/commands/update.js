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
module.exports.permissions = [
	{ user: '*' }
];

module.exports.command = async function(message, params) {
	try {
		await apis.CrystalMathLabs.update_player(params[0]);
	} catch(e) {
		if (e.code == 2)
			return Discord.code_block('Player not on hiscores.');
		// Player updated in the last 30 seconds is not a problem
		if (e.code != 5)
			throw e;
	}
	return Discord.code_block('Player successfully updated!')	+
		Discord.link('https://crystalmathlabs.com/tracker/track.php?player=' + params[0].replace(/\s/g, '+'));
};
