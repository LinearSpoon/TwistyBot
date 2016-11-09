var rs_functions = custom_require('rs_functions');
var rs_justice = custom_require('api_wrappers/rs_justice');

var inactive_threshold = 1000 * 60 * 5; // Length of time required to appear on the inactive report
var history_file       = global.server_directory + '/config/player_history.json';

function generate_reports()
{
	// https://docs.google.com/spreadsheets/d/1N2fzS9Bd_BZ7EwzWbS8YRDGQipIo8DCDlHYmJUEmXAs/edit#gid=0
	var id_col    = 1;
	var user_col  = 2;
	var cmb_col   = 4;
	var first_row = 15;
	var last_row  = first_row + 10;
	var first_col = Math.min(id_col, user_col, cmb_col);
	var last_col  = Math.max(id_col, user_col, cmb_col)

	var report_missing    = []; // Missing from hiscores
	var report_cb_changed = []; // Combat levels gained
	var report_inactive   = []; // Long time no see
	var report_rsj        = []; // Found player on RSJustice
	var report_levelup    = []; // Gained some levels
	var report_warnings   = []; // Problems that came up during the report
	var save_history      = {}; // Data to be saved after reports are generated

	var report_time       = Date.now();

	google_spreadsheet.read_cells(config.get('clan_spreadsheet'), 1, first_col, last_col, first_row, last_row)
		.then(async function(cells) {
			var player_history = json_config.load(history_file);

			for(var i = first_row; i < last_row; i++)
			{
				var old_player = player_history[player.name];
				var player = {
					id: cells[id_col][i].numericValue,
					name: cells[user_col][i].value,
					cb: cells[cmb_col][i].numericValue,
					last_change: report_time
				};

				if (player.name == '')
					continue;

				console.log('Checking', player.name);
				try {
					player.stats = await rs_hiscores(player.name);
					check_inactive(report_inactive, old_player, player);
					check_combat_change(report_cb_changed, player);
				} catch(err) {
					console.log('Could not find', player.name, err.message);
					check_missing(report_missing, old_player, player, err)
				}

				try {
					var details = await rs_justice(player.name);
					if (details)
					{
						player.rsj = details;
						report_rsj.push(player);
					}
				} catch(err) {
					report_warnings.push('Failed RSJ lookup of ' + player.name);
				}

				// Save new player records
				if (!player.actually_missing)
					save_history[player.name] = player;
			}

			// Write saved records out to file
			json_config.save(history_file, save_history);
		})
		.catch( err => return_error(message, err) );
};

function check_inactive(report, old_player, player)
{
	if (!old_player)
		return; // No records of this player

	if (old_player.stats.overall == player.stats.overall)
	{ // No change from previous stats
		if (player.last_change - old_player.last_change > inactive_threshold)
			report.push(player);
		// Keep the older time
		player.last_change = old_player.last_change;
	}
}

function check_combat_change(report, player)
{
	player.new_cb = rs_functions.combat_level(player.stats);
	if (player.new_cb != player.cb)
		report.push(player);
}

function check_missing(report, old_player, player, err)
{
	// Are hiscores working?
	player.actually_missing = (err.message == 'Player not found.');
	report.push(player);

	// Save their old info
	if (old_player)
	{
		player.stats = old_player.stats;
		player.last_change = old_player.last_change;
	}
}
