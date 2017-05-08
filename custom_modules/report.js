var get_clan_list = custom_require('report/sources/clan_list');

module.exports.update_sources = async function() {
	console.log('Begin report update...');
	var report = {start_date: Date.now()};
	report.clan_list = await get_clan_list(); //75,4
	for(var i = 0; i < report.clan_list.length; i++)
	{
		var skills = await apis.RuneScape.lookup_player(report.clan_list[i].name, { max_attempts: 100 });
		if (skills)
			apis.Spoon.save_player_exp_history(report.clan_list[i].name, skills);
	}
	report.end_date = Date.now();

	await util.save_json_file(global.server_directory + '/storage/latest_report.json', report);
	console.log('Report update finished.');
};

module.exports.check_all = async function() {
	var report = await util.load_json_file(global.server_directory + '/storage/latest_report.json', []);
	report.sections = {
		cb_changed: { title: 'Combat changed:', header: 'ID  Name            Change\n', data: [] },
		inactive: { title: 'Inactive:', header: 'ID  Name            Last seen\n', data: [] },
		rsjustice: { title: 'RSJustice:', header: '', data: [] }
	};

	for(var i = 0; i < report.clan_list.length; i++)
	{
		var member = report.clan_list[i];
		var history = await apis.Spoon.load_player_exp_history(member.name);

		check_player(report, member, history);
	}

	return report;
};


const one_day = 1000 * 60 * 60 * 24;
const inactive_time = 14 * one_day;
async function check_player(report, member, history)
{
	if (history.length > 0)
	{
		// Check cb changed
		var new_cb = Math.floor(apis.RuneScape.combat_level(history[0].skills));

		if (new_cb != member.cb)
			report.sections.cb_changed.data.push( util.printf('%-3d %-12s    %-3d->%-3d', member.id, member.name, member.cb, new_cb) );

		// Check inactive
		var current_xp = history[0].skills.overall.xp;
		var oldest_current = history
			.filter( record => record.skills.overall.xp == current_xp )  // record must match current xp
			.reduce( (a,b) => a.timestamp > b.timestamp ? b : a ); // record must be the oldest of this filtered set

		if (oldest_current.timestamp < Date.now() - inactive_time) // Cutoff time for inactive
		{
			report.sections.inactive.data.push(
				util.printf('%-3d %-12s    %-14s', member.id, member.name, Math.floor((Date.now() - oldest_current.timestamp) / one_day) + ' days ago')
			);
		}
	}

	// Check rsjustice
	// var rsj_check = await apis.RSJustice.lookup(member.name);
	// if (rsj_check.length > 0)
	// 	report.sections.rsjustice.data.push(member.id + ': ' + member.name + ' ' + rsj_check[0].url);
};



// Keep this below the update_sources definition
if (config.get('auto_update_report'))
{
	// Set up to automatically run every four hours
	var CronJob = require('cron').CronJob;
	// sec min hours day month dayofwk
	var job = new CronJob('00 0 */4 * * *', module.exports.update_sources, null, true);
}
