// Find members whose combat level is different from the clan spreadsheet
module.exports = function(clan_list) {
	var report = clan_list
		.filter(function(member) {
			if (member.history.length == 0)
				return false;

			member.new_cb = Math.floor(apis.RuneScape.combat_level(member.history[0].hiscores));
			return member.cb != member.new_cb;
		})
		.map(member => util.printf('%-3d %-12s    %-3d->%-3d', member.id, member.name, member.cb, member.new_cb));

	return 'Members who changed combat level: ' + report.length + util.dm.code_block('\nID  Name            Change\n' + report.join('\n'));
};
