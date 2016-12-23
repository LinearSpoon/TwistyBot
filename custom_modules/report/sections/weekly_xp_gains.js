// Find members who had haven't gained xp for more than two weeks
const ten_minutes = 1000 * 60 * 10;
const five_hours = 1000 * 60 * 60 * 5;
const seven_days = 1000 * 60 * 60 * 24 * 7;

var moment = require('moment-timezone');

module.exports = function(clan_list) {
	var high_limit = Date.now() - seven_days + ten_minutes;
	var low_limit = Date.now() - seven_days - five_hours;

	console.log(moment(low_limit).format('MMM D h:mm A'))
	console.log(moment(high_limit).format('MMM D h:mm A'))

	// Find members who have a history record in the valid time range and save it
	var filtered_clan = clan_list
		.filter(function(member) {
			if (!member.history || !member.rshiscores)
				return false;

			// Do they have a record in the time range?
			var valid_records = member.history.filter(record => record.timestamp > low_limit && record.timestamp < high_limit);
			if (valid_records.length == 0)
				return false;

			// Take the newest valid record
			member.comp_record = valid_records.reduce( (a,b) => a.timestamp > b.timestamp ? a : b );
			return member.comp_record;
		});

	if (filtered_clan.length == 0)
		return "Exp gains in the past day:\nCould not find any records to use.";

	// Find members who have the greatest change for each skill
	var report = [];
	for(var i = 0; i < apis.RuneScape.skills.length; i++)
	{
		var s = apis.RuneScape.skills[i];
		report.push({
			skill: s,
			member: filtered_clan.reduce( function(a,b) {
				var a_diff = a.rshiscores[s].xp - a.comp_record.hiscores[s].xp;
				var b_diff = b.rshiscores[s].xp - b.comp_record.hiscores[s].xp;
				return a_diff > b_diff ? a : b;
			})
		})
	}

	report = report.map(function(winner) {
		//console.log(winner);
		var xp_diff = 0; var name = 'Nobody';
		if (winner.member)
		{
			xp_diff = winner.member.rshiscores[winner.skill].xp - winner.member.comp_record.hiscores[winner.skill].xp;
			name = winner.member.name;
		}

		return util.printf('%-14s %-12s    %10s', winner.skill, name, util.format_number(xp_diff));
	});

	return 'Exp gains in the past week: ' + util.dm.code_block('\nSkill          Name             Gained Xp\n' + report.join('\n'));
};
