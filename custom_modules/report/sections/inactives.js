// Find members who had haven't gained xp for more than two weeks
const one_day = 1000 * 60 * 60 * 24;
const inactive_time = 14 * one_day;

module.exports = function(clan_list) {
	var limit = Date.now() - inactive_time; // Cutoff time for inactive

	var report = clan_list
		.filter(function(member) {
			if (member.history.length == 0)
				return false;

			var current_xp = member.history[0].hiscores.overall.xp;
			// Keep if their xp is the same as recorded more than two weeks ago
			return member.history.find(record => current_xp == record.hiscores.overall.xp && record.timestamp < limit);
		})
		.map(function(member) {
			// The last time their xp changed should be the oldest record matching their current xp
			var current_xp = member.history[0].hiscores.overall.xp;
			var newest = member.history
				.filter(record => current_xp == record.hiscores.overall.xp)
				.reduce( (a,b) => a.timestamp > b.timestamp ? b : a );


			return util.printf('%-3d %-12s    %-14s', member.id, member.name, util.approximate_time(Date.now(), newest.timestamp) + ' ago');
		});

	return 'Inactive members: ' + report.length + Discord.code_block('\nID  Name            Last seen\n' + report.join('\n'));
};
