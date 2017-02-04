// Find members with the highest exp gain in each skill over the past week
const ten_minutes = 1000 * 60 * 10;
const five_hours = 1000 * 60 * 60 * 5;
const seven_days = 1000 * 60 * 60 * 24 * 7;

var moment = require('moment-timezone');

module.exports = function(clan_list) {
	var high_limit = Date.now() - seven_days + ten_minutes;
	var low_limit = Date.now() - seven_days - five_hours;

	console.log('Weekly xp low limit: ', moment(low_limit).format('MMM D h:mm A'))
	console.log('Weekly xp high limit:', moment(high_limit).format('MMM D h:mm A'))

	// Find members who have a history record in the valid time range and save it
	var filtered_clan = clan_list
		.filter(function(member) {
			// Do they have a record in the time range?
			// The history is sorted from newest to oldest, so comp_record will always be the newest valid record
			var comp_record = member.history.find(record => record.timestamp > low_limit && record.timestamp < high_limit);
			if (!comp_record)
				return false;

			// Save records to be used
			member.current_xp = member.history[0].hiscores;
			member.previous_xp = comp_record.hiscores;

			return true;
		});

	if (filtered_clan.length == 0)
		return "Exp gains in the past week:\nCould not find any records to use.";

	// Find members who have the greatest change for each skill
	var report = [];
	for(var i = 0; i < apis.RuneScape.skills.length; i++)
	{
		var s = apis.RuneScape.skills[i];
		report.push({
			skill: s,
			member: filtered_clan.reduce( function(a,b) {
				var a_diff = a.current_xp[s].xp - a.previous_xp[s].xp;
				var b_diff = b.current_xp[s].xp - b.previous_xp[s].xp;
				return a_diff > b_diff ? a : b;
			})
		})
	}

	report = report.map(function(line) {
		var xp_diff = -1; var name = 'Nobody'; var skill = line.skill;
		if (line.member)
		{
			xp_diff = line.member.current_xp[skill].xp - line.member.previous_xp[skill].xp;
			name = line.member.name;
		}

		return util.printf('%-14s %-12s    %10s', skill, name, util.format_number(xp_diff));
	});

	return 'Exp gains in the past week: ' + Discord.code_block('\nSkill          Name             Gained Xp\n' + report.join('\n'));
};
