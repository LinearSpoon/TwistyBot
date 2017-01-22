const fmt = '%-13s %-s\n';
module.exports = async function(client, message, params) {
	var commands =
		"Runescape commands:\n" +
		util.printf(fmt, '!cb', 'Display OldSchool player combat stats.') +
		util.printf(fmt, '!price', 'Retrieves price of items from RSBuddy.') +
		util.printf(fmt, '!rsj', 'Lookup a player on RS Justice.') +
		util.printf(fmt, '!split', 'Calculates split amounts.') +
		util.printf(fmt, '!stats', 'Display OldSchool player stats.') +
		util.printf(fmt, '!time', 'Display the current time in different time zones.') +
		util.printf(fmt, '!ttm', 'Check hours to max stats with efficient training.') +
		util.printf(fmt, '!update', 'Updates a single player on CrystalMathLabs.');

	if (util.message_in(message, 'deities_channels'))
	{
		commands +=
			'\nDeities commands:\n' +
			util.printf(fmt, '!history', 'Display a list of logged hiscores data for a player.') +
			util.printf(fmt, '!report', 'View daily clan report.') +

			'\nMusic commands (only in #music):\n' +
			util.printf(fmt, '!clear', 'Clear queued songs.') +
			util.printf(fmt, '!disconnect', 'Ask the bot to leave the voice channel.') +
			util.printf(fmt, '!np', 'Show currently playing song.') +
			util.printf(fmt, '!pause', 'Pause currently playing song.') +
			util.printf(fmt, '!play', 'Add a new song to the queue.') +
			util.printf(fmt, '!queue', 'Show pending songs.') +
			util.printf(fmt, '!restart', 'Restart the music bot (may fix sound issues).') +
			util.printf(fmt, '!resume', 'Unpause current song.') +
			util.printf(fmt, '!shuffle', 'Randomize the queue.') +
			util.printf(fmt, '!skip', 'Skip the currently playing song.') +
			util.printf(fmt, '!summon', 'Ask the bot to join your voice channel.') +
			util.printf(fmt, '!volume', 'Set the music volume.');
	}

	return util.dm.code_block(commands);
};
