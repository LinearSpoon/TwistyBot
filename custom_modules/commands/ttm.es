module.exports = async function(client, message, params) {
	if (params.length != 1)
	{
		throw Error('Usage: !ttm <player name>\n\nExamples:'
			+ '\n!ttm twisty fork\n!ttm vegakargdon');
	}
	var hours = await apis.CrystalMathLabs.time_to_max(params[0]);
	return util.dm.code_block(hours + ' hours');
};
