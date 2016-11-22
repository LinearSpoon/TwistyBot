// https://docs.google.com/spreadsheets/d/1N2fzS9Bd_BZ7EwzWbS8YRDGQipIo8DCDlHYmJUEmXAs/edit#gid=0
/*
var google_spreadsheet = custom_require('api_wrappers/spreadsheet');
var json_config = custom_require('json_config');
var rs_functions = custom_require('rs_functions');
var rs_justice = custom_require('api_wrappers/rs_justice');
var rs_hiscores = custom_require('api_wrappers/rs_hiscores');
var columnify = require('columnify');

var inactive_threshold = 1000 * 60 * 5; // Length of time required to appear on the inactive report
var history_file       = global.server_directory + '/config/player_history.json';
var report_file        = global.server_directory + '/config/latest_report.json';

function fmt_timestamp(ts)
{
	const one_day = 1000 * 60 * 60 * 24;
	if (ts == 0) return 'Never';

	return Math.floor((Date.now() - ts) / one_day) + ' days ago';
}

function send_report(message, lead_in, report)
{
	var data = columnify(report, {
		showHeaders: true,
		config: {
			name: { minWidth: 18 },
		}
	});
	message.split_channel_message(lead_in + util_old.wrap_code(data));
}

module.exports = async function(client, message, params)
{
	console.log('Begin report.');
	await generate_reports();
	await util_old.sleep(1000);
	var reports = json_config.load(report_file);

	if (reports.missing && reports.missing.length > 0)
		send_report(message, 'Players missing from hiscores:', reports.missing.map(e => ({ name: e.name, last_seen: fmt_timestamp(e.last_change) }) ));
	if (reports.cmb_changed && reports.cmb_changed.length > 0)
		send_report(message, 'Players who changed combat level:', reports.cmb_changed.map(e => ({ name: e.name, was: e.cb, now: e.new_cb }) ));
	if (reports.inactive && reports.inactive.length > 0)
		send_report(message, 'Players who have been inactive > 2 weeks:', reports.inactive.map(e => ({ name: e.name, last_seen: fmt_timestamp(e.last_change) }) ));
	if (reports.rsjustice && reports.rsjustice.length > 0)
		send_report(message, 'Players listed on RSJustice:', reports.rsjustice.map(e => ({ name: e.name, url: e.rsj.url }) ));
	if (reports.warnings && reports.warnings.length > 0)
		send_report(message, 'Additional warnings:', reports.warnings.map( (e,i) => ({ '#':i, warning:e }) ));

}

async function generate_reports()
{
	// Specific to the clan spreadsheet:
	var id_col    = 1;
	var user_col  = 2;
	var cmb_col   = 4;
	var first_row = 5;
	var last_row  = first_row + 200;
	var first_col = Math.min(id_col, user_col, cmb_col);
	var last_col  = Math.max(id_col, user_col, cmb_col)

	// Report containers and variables
	var report = {
		missing: [], // Missing from hiscores
		cmb_changed: [], // Combat levels gained
		rsjustice: [], // Found player on RSJustice
		inactive: [], // Long time no see
		warnings: [], // Problems that came up during the report
		time: Date.now()
	};
	var player_history    = json_config.load(history_file);
	var save_history      = {}; // Data to be saved after reports are generated

	var cells = await google_spreadsheet.read_cells(config.get('clan_spreadsheet'), 1, first_col, last_col, first_row, last_row);

	for(var i = first_row; i < last_row; i++)
	{
		// Extract player data from cells
		var player = {
			id: cells[id_col][i].numericValue,
			name: cells[user_col][i].value,
			cb: cells[cmb_col][i].numericValue,
			last_change: 0
		};

		if (player.name == '')
			continue;

		console.log('Checking ' + player.name);

		// Extract historical data from save file
		var old_player = player_history[player.name];

		// Hiscores check
		try {
			player.stats = await rs_hiscores.lookup(player.name);
			if (player.stats)
			{ // Player found
				check_inactive(report, old_player, player);
				check_combat_change(report, player);
			}
			else
			{ // Player not found
				check_missing(report, old_player, player)
			}
		} catch (e) {
			report.warnings.push('Failed hiscores lookup of ' + player.name);
		}

		// RSJustice check
		try {
			var details = await rs_justice.lookup(player.name);
			if (details)
			{
				player.rsj = details;
				report.rsjustice.push(player);
			}
		} catch (e) {
			report.warnings.push('Failed RSJ lookup of ' + player.name);
		}

		// Save new player records
		if (!player.actually_missing)
			save_history[player.name] = player;

		await util_old.sleep(5000);
	}

	// Write saved records out to file
	json_config.save(history_file, save_history);
	json_config.save(report_file, report);
};

function check_inactive(report, old_player, player)
{
	player.last_change = report.time;

	if (!old_player)
		return; // No records of this player

	if (old_player.stats.overall == player.stats.overall)
	{ // No change from previous stats
		if (report.time - old_player.last_change > inactive_threshold)
			report.inactive.push(player);
		// Keep the older time
		player.last_change = old_player.last_change;
	}
}

function check_combat_change(report, player)
{
	player.new_cb = Math.floor(rs_functions.combat_level(player.stats));
	if (player.new_cb != player.cb)
		report.cmb_changed.push(player);
}

function check_missing(report, old_player, player)
{
	report.missing.push(player);
	if (old_player)
	{	// Copy stats from history if available
		player.stats = old_player.stats;
		player.last_change = old_player.last_change;
	}
}

*/
