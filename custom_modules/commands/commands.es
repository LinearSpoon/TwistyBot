const fmt = '%-13s %-s\n';
module.exports = async function(message, params) {
	var commands =
		util.printf(fmt, '!price', 'Retrieves price of items from RSBuddy.') +
		util.printf(fmt, '!update', 'Updates a single player on CrystalMathLabs.') +
		util.printf(fmt, '!ttm', 'Check hours to max stats with efficient training.') +
		util.printf(fmt, '!stats', 'Display OldSchool player stats.') +
		util.printf(fmt, '!cb', 'Display OldSchool player combat stats.') +
		util.printf(fmt, '!rsj', 'Lookup a player on RS Justice.') +
		util.printf(fmt, '!time', 'Display the current time in different time zones.');
		util.printf(fmt, '!split', 'Calculates split amounts.');

	if (util.message_in(message, 'deities_channels'))
	{
		commands +=
			util.printf(fmt, '!report', 'View daily clan report.') +
			util.printf(fmt, '!history', 'Display a list of logged hiscores data for a player.') +
			util.printf(fmt, '!help', 'Display music commands (only in the music channel).');
	}

	return util.dm.code_block(commands);
};
