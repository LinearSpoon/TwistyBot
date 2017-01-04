var moment = require('moment-timezone');

module.exports = async function(message, params) {
	if (!util.message_in(message, 'deities_channels'))
		return;

	if (!params[1])
		params[1] = 'overall';

	if (params.length == 0 || params.length > 2)
	{
		throw Error('Usage: !history <clan member>, <stat>\n\nExamples:\n!history Twisty Fork, overall\n!history vegakargdon, strength' +
			'\nAvailable stats: ' + apis.RuneScape.skills.join(','));
	}

	var player = await database.query('SELECT * FROM players WHERE name = ?;', params[0]);
	if (player.length == 0)
		throw Error("Player not found.");

	var history = await database.query('SELECT * FROM hiscores_history WHERE player_id = ?;', player[0].id);

	// Transform history object for graph rendering
	history = history.map(function(row) {
		var details = JSON.parse(row.hiscores)[params[1]];
		return {
			timestamp: row.timestamp,
			value: details.xp,
			details: details
		};
	});


	message.channel.sendFile(util.graph.line_chart(history), 'history.png', 'Xp');

	return 'Here are my records for ' + player[0].name + '(' + params[1] + '):\n' + util.dm.code_block(
		util.printf('%-15s %6s %14s %8s\n', 'Date', 'Level', 'Xp', 'Rank') +	history.map(function(row) {
			return util.printf('%-6s %8s %6d %14s %8s',
				moment(row.timestamp).format('MMM D'),
				moment(row.timestamp).format('h:mm A'),
				details.level,
				util.format_number(details.xp),
				util.format_number(details.rank));
		}).join('\n'));

};
