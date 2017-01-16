// Data sources
var get_clan_list = custom_require('report/sources/clan_list');
var get_clan_hiscores = custom_require('report/sources/rshiscores');

// Report sections
var find_inactive = custom_require('report/sections/inactives');
var find_rsjustice = custom_require('report/sections/rsjustice');
var find_missing = custom_require('report/sections/missing');
var find_cb_changed = custom_require('report/sections/cb_changed');
var find_daily_xp_gains = custom_require('report/sections/daily_xp_gains');
var find_weekly_xp_gains = custom_require('report/sections/weekly_xp_gains');

var moment = require('moment-timezone');

if (config.get('auto_update_report'))
{
	// Set up to automatically run every four hours
	var CronJob = require('cron').CronJob;
	// sec min hours day month dayofwk
	var job = new CronJob('00 0 */4 * * *', update_report, null, true);
}


module.exports = async function(client, message, params) {
	if (!util.message_in(message, 'deities_channels'))
		return;

	if (params[0] == 'update')
		await update_report();

	var report = await load_report_data();

	console.log('Formatting report...');
	var report_str = 'Report time: ' + moment(report.end_date).format('MMM D, h:mm A')
		+ '\n\n' + find_inactive(report.clan_list)
		+ '\n\n' + find_rsjustice(report.clan_list)
		+ '\n\n' + find_cb_changed(report.clan_list)
		+ '\n\n' + find_missing(report)
		+ '\n\n' + find_daily_xp_gains(report.clan_list)
		+ '\n\n' + find_weekly_xp_gains(report.clan_list);

	return report_str;
}

// Refresh data that takes a long time to access
async function update_report()
{
	console.log('Begin report update...');
	var report = {start_date: Date.now()};
	report.clan_list = await get_clan_list(); //75,4
	// Load all data
	await Promise.all([
		get_clan_hiscores(report.clan_list),
	]);
	report.end_date = Date.now();

	await util.save_json_file(global.server_directory + '/storage/latest_report.json', report);
	console.log('Report finished.');
}

/*
	Clan list format:
	[{
		id: spreadsheet row id
		name: player name
		cb: spreadsheet combat level
		history: [{
			timestamp: date of lookup
			hiscores: hiscores skills object
		}]
		rsjustice: [{
			rsjustice detail object
		}]
	}]
*/
async function load_report_data()
{
	var report = await util.load_json_file(global.server_directory + '/storage/latest_report.json', []);
	var hiscores_history = await database.query('SELECT * FROM hiscores_history;');
	var players = await database.query('SELECT * FROM players');
	for(var i = 0; i < report.clan_list.length; i++)
	{
		var member = report.clan_list[i];
		// Find player_id for this member
		var player = players.find( p => p.name.toLowerCase() == member.name.toLowerCase() );
		if (!player)
		{
			console.log('Could not find player id for', member.name);
			continue;
		}
		// Extract history entries for this player, sorted from newest to oldest
		member.history = hiscores_history
			.filter(row => row.player_id == player.id)
			.map(row => ({ timestamp: row.timestamp, hiscores: JSON.parse(row.hiscores) }))
			.sort( (a,b) => b.timestamp - a.timestamp );

		// Also check them on RSJ
	 	member.rsjustice = []; //await apis.RSJustice.lookup(member.name);
	}
	return report;
}

// TODO:
// Search forum posts
// Search for level ups (99s?)
