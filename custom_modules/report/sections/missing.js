// Find members who did not appear on the hiscores
module.exports = function(report) {
	var data = report.clan_list
		.filter(member => member.history.length == 0 || member.history[0].timestamp < report.start_date)
		.map(member => util.printf('%-3d %-12s', member.id, member.name));

	return 'Members not on hiscores: ' + data.length + Discord.code_block('\nID  Name\n' + data.join('\n'));
};
