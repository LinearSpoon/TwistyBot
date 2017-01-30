const fmt = '!%-13s %-s\n';
const commands = require('./index.js');

module.exports.whitelist = null;
module.exports.params = {
	min: 0,
	max: 999,
	help: `Usage: !help`
};
module.exports.command = async function(client, message, params) {
	var response = '';

	// Sort commands by category
	var sorted = {};
	for(var k in commands)
	{
		var c = commands[k];
		if (!c.help)
			continue; // Help properties not defined
		// Check if this command can be used in this channel
		if (c.whitelist === null || c.whitelist.indexOf(message.channel.id) > -1)
		{
			// Create array or append new command
			if (!sorted[c.help.category])
				sorted[c.help.category] = [c];
			else
				sorted[c.help.category].push(c);
		}
	}

	// Output each category in turn
	for(var k in sorted)
	{
		var category = sorted[k];
		response += k + ' commands:\n';
		for(var i in category)
		{
			var c = category[i];
			response += util.printf(fmt, c.help.name, c.help.text);
		}
		response += '\n';
	}

	// Handled by another process
	response += 'Music commands (only in certain channels):\n' +
		util.printf(fmt, 'clear', 'Clear queued songs.') +
		util.printf(fmt, 'disconnect', 'Ask the bot to leave the voice channel.') +
		util.printf(fmt, 'np', 'Show currently playing song.') +
		util.printf(fmt, 'pause', 'Pause currently playing song.') +
		util.printf(fmt, 'play', 'Add a new song to the queue.') +
		util.printf(fmt, 'queue', 'Show pending songs.') +
		util.printf(fmt, 'restart', 'Restart the music bot (may fix sound issues).') +
		util.printf(fmt, 'resume', 'Unpause current song.') +
		util.printf(fmt, 'shuffle', 'Randomize the queue.') +
		util.printf(fmt, 'skip', 'Skip the currently playing song.') +
		util.printf(fmt, 'summon', 'Ask the bot to join your voice channel.') +
		util.printf(fmt, 'volume', 'Set the music volume.');

	return util.dm.code_block(response);
};
