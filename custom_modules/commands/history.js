var moment = require('moment-timezone');
const two_weeks = 14 * 24 * 60 * 60 * 1000;


module.exports.help = {
	name: 'history',
	text: 'Display a list of logged hiscores data for a player.',
	category: 'Deities'
};
module.exports.permissions = [
	//{ guild: '160833724886286336' } // Deities of PvM
];
module.exports.params = {
	min: 1,
	max: 2,
	help:
`Usage: !history <username>, <stat>

Examples:
!history Twisty Fork, overall
!history vegakargdon, strength

This command only returns data for players on the Deities clan spreadsheet.
Available stats: ` + apis.RuneScape.skills.join(', ')
};
module.exports.command = async function(message, params) {
	if (!params[1])
		params[1] = 'overall';

	var player = await database.query('SELECT * FROM players WHERE name = ?;', params[0]);
	if (player.length == 0)
		return Discord.code_block('Player not found.');

	var history = await database.query('SELECT * FROM hiscores_history WHERE player_id = ? AND timestamp > ?;', player[0].id, Date.now() - two_weeks);

	// Transform history object for graph rendering
	history = history.map(function(row) {
		var details = JSON.parse(row.hiscores)[params[1]];
		return {
			timestamp: row.timestamp,
			value: details.xp,
			details: details
		};
	});

	//message.channel.sendFile(util.graph.line_chart(history), 'history.png', 'Xp');

	return 'Here are my records for ' + player[0].name + '(' + params[1] + '):\n' + Discord.code_block(
		util.printf('%-15s %6s %14s %8s\n', 'Date', 'Level', 'Xp', 'Rank') +	history.map(function(row) {
			return util.printf('%-6s %8s %6d %14s %8s',
				moment(row.timestamp).format('MMM D'),
				moment(row.timestamp).format('h:mm A'),
				row.details.level,
				util.format_number(row.details.xp),
				util.format_number(row.details.rank));
		}).join('\n'));

};
