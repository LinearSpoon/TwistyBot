// https://docs.google.com/spreadsheets/d/1N2fzS9Bd_BZ7EwzWbS8YRDGQipIo8DCDlHYmJUEmXAs/edit#gid=0

var inactive_threshold = 1000 * 60 * 60 * 24  *14; // Length of time required to appear on the inactive report
var history_file       = global.server_directory + '/storage/player_history.json';
var report_file        = global.server_directory + '/storage/latest_report.json';

// Set up to automatically run at 1am every night
var CronJob = require('cron').CronJob;
// sec min hours day month dayofwk
var job = new CronJob('00 0 1 * * *', generate_reports, null, true);



module.exports = async function(params)
{
	// A parameter to force update the report
	if (params[0] == 'update')
		return format_reports(await generate_reports());

	// Check if we have a good cached report
	var reports = await util.load_json_file(report_file, null);
	if (!reports || Date.now() - reports.time_finished > 1000 * 60 * 60 * 20)
		reports = await generate_reports();

	return format_reports(reports);
}

// Returns array of clan members
//   member.id => spreadsheet row id
//   member.name => player name
//   member.cb => combat listed on the sheet
async function get_clan_list()
{
	// Specific to the clan spreadsheet:
	var id_col    = 1;
	var user_col  = 2;
	var cmb_col   = 4;
	var first_row = 5;
	var last_row  = first_row + 200;
	var first_col = Math.min(id_col, user_col, cmb_col);
	var last_col  = Math.max(id_col, user_col, cmb_col)

	var cells = await apis.GoogleSS.read_cells(config.get('clan_spreadsheet'), 1, first_col, last_col, first_row, last_row);

	var clan_list = [];
	for(var i = first_row; i < last_row; i++)
	{
		var player_name = cells[user_col][i].value;
		if (player_name == '')
			continue; // Row is blank

		clan_list.push({
			id: cells[id_col][i].numericValue,
			name: player_name.replace(/[^a-zA-Z0-9_ -]/g,''),
			cb: cells[cmb_col][i].numericValue
		});
	}

	console.log('Loaded clan list.', clan_list.length, 'members.');
	return clan_list;
}

// Checks each member for RSJustice infractions
async function check_rsjustice(clan_list)
{
	for(var i = 0; i < clan_list.length; i++)
	{
		var member = clan_list[i];
		try {
			// We don't need to delay each request here, due to caching after the first lookup
			member.rsjustice = await apis.RSJustice.lookup(member.name);
		} catch(e) {
			// Request error probably, wait a bit and retry
			console.warn('RSJ error during report: (' + member.name + ')' + e.message);
			await util.sleep(5000);
			i = i - 1;
		}
	}
	console.log('Loaded RSJustice.');
}

// Loads the stats of each member
async function check_rshiscores(clan_list)
{
	for(var i = 0; i < clan_list.length; i++)
	{
		var member = clan_list[i];
		try {
			console.log('RSHiscores:', member.id, member.name);
			member.rshiscores = await apis.RuneScape.lookup_player(member.name);
			// Calculate their combat level if we got stats back
			if (member.rshiscores)
				member.calculated_cb = Math.floor(apis.RuneScape.combat_level(member.rshiscores));
		} catch(e) {
			// Request error, wait a bit and retry
			console.warn('RSHS error during report: (' + member.name + ')' + e.message);
			i = i - 1;
		}
		// Always wait before sending another request
		await util.sleep(5000);
	}
	console.log('Loaded RSHiscores');
}

// Load historic data for clan members if available
async function check_history(clan_list)
{
	var history = await util.load_json_file(history_file);
	if (!history.length)
	{
		console.warn('History not found. Giving up.');
		return;
	}
	for(var i = 0; i < clan_list.length; i++)
	{
		var member = clan_list[i];
		// Members who changed their name will lose their history
		var name = member.name.toLowerCase();
		member.history = history.find( e => e.name.toLowerCase() == name);
	}

	console.log('History loaded.');
}

async function generate_reports()
{
	console.log('Begin report.');
	var start_date = Date.now();
	var clan_list = await get_clan_list();
	// All lookups are from different sources so can run in parallel
	await Promise.all([
		check_rsjustice(clan_list),
		check_rshiscores(clan_list),
		check_history(clan_list)
	]);
	// All data should be loaded here
	// member.name, member.id, member.cb, member.rsjustice, member.rshiscores, member.history

	var reports = { time_finished: Date.now(), time_taken: Date.now() - start_date };
	reports.inactive = find_inactive(clan_list);
	reports.cmb_changed = find_cb_changed(clan_list);
	reports.rs_justice = find_rs_justice(clan_list);
	reports.missing = find_missing(clan_list);

	// Save full data
	await util.save_json_file(report_file, reports);

	// Remove members who were not on hiscores
	clan_list = clan_list.filter(member => typeof member.rshiscores != 'undefined');
	// Strip unnecessary fields
	clan_list = clan_list.map(function(member) {
		return {
			name: member.name,
			rshiscores: member.rshiscores,
			last_seen: member.last_seen
		};
	});
	// Save history
	await util.save_json_file(history_file, clan_list);

	console.log('Report finished in', reports.time_taken / 60000, 'minutes.');
	return reports;
}


// Each of these functions should return a filtered clan list of the players matched by the report criteria
function find_inactive(clan_list)
{
	var now = Date.now();
	return clan_list.filter(function(member) {
		if (typeof member.rshiscores == 'undefined')
			return false; // Reported elsewhere

		if (typeof member.history == 'undefined')
		{ // This is a new member - can't be inactive yet
			//console.log('Last seen', member.name, 'never');
			member.last_seen = now;
			return false;
		}

		if (member.rshiscores.overall.xp != member.history.rshiscores.overall.xp)
		{ // Member has gained xp, so is active
			//console.log('Last seen', member.name, 'now');
			member.last_seen = now;
			return false;
		}

		//console.log('Last seen', member.name, 'some time ago');
		// Member has not gained any xp
		member.last_seen = member.history.last_seen;
		return (now - member.history.last_seen > inactive_threshold);
	}).map(function(member) {
		return { id: member.id, name: member.name, last_seen: member.last_seen };
	});
}

function find_cb_changed(clan_list)
{
	return clan_list.filter(function(member) {
		return member.rshiscores && member.calculated_cb != member.cb;
	}).map(function(member) {
		return { id: member.id, name: member.name, old_cb: member.cb, new_cb: member.calculated_cb };
	});
}

function find_rs_justice(clan_list)
{
	return clan_list.filter(member => typeof member.rsjustice !== 'undefined').map(function(member) {
		return { id: member.id, name: member.name, details: member.rsjustice };
	});
}

function find_missing(clan_list)
{
	return clan_list.filter(member => typeof member.rshiscores == 'undefined').map(function(member) {
		return { id: member.id, name: member.name };
	});
}

function format_reports(reports)
{
	const one_day = 1000 * 60 * 60 * 24;
	var report_str = '';

	report_str += 'Inactive members: ' + reports.inactive.length + '\n'
		 + util.dm.table(reports.inactive.map(member => [member.id, member.name, Math.floor((Date.now() - member.last_seen) / one_day)]),
		 [3, 15], ['left', 'left', 'left'], ['ID', 'Name', 'Days']);

	report_str += '\n\nMembers on RSJustice: ' + reports.rs_justice.length + '\n'
		 + reports.rs_justice.map(member => member.id + ': ' + member.name + ' ' + member.details.url).join('\n');


	report_str += '\n\nMembers who changed combat level: ' + reports.cmb_changed.length + '\n'
		+ util.dm.table(reports.cmb_changed.map(member => [member.id, member.name, member.old_cb + '->' + member.new_cb]),
 		[3, 15], ['left', 'left', 'left'], ['ID', 'Name', 'Change']);

	report_str += '\n\nMembers not on hiscores: ' + reports.missing.length + '\n'
		+ util.dm.table(reports.missing.map(member => [member.id, member.name]),
 		[3, 15], ['left', 'left'], ['ID', 'Name']);

	return report_str;
}

// TODO:
// Search forum posts
// Search for level ups (99s?)
