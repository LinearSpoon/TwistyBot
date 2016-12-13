// Find members who did not appear on the hiscores
module.exports = function(clan_list) {
	var report = clan_list
		.filter(member => typeof member.rshiscores === 'undefined')
		.map(member => util.printf('%-3d %-12s', member.id, member.name));

	return 'Members not on hiscores: ' + report.length + util.dm.code_block('\nID  Name\n' + report.join('\n'));
};
