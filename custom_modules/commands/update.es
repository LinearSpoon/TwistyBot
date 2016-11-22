module.exports = async function(params) {
	if (params.length != 1)
	{
		throw Error('Usage: !update <player name>\n\nExamples:'
			+ '\n!update twisty fork\n!update vegakargdon');
	}

	await apis.CrystalMathLabs.update_player(params[0]);
	return util.dm.code_block('Player successfully updated!');
};
