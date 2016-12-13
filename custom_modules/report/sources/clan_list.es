// Returns array of clan members
//   member.id => spreadsheet row id
//   member.name => player name
//   member.cb => combat listed on the sheet
module.exports = async function(start, count) {
	// Specific to the clan spreadsheet:
	console.log('Loading clan list...');
	var ws_info = await apis.GoogleSS.sheet_info(config.get('clan_spreadsheet'));
	//console.log(ws_info.worksheets);
	var id_col    = 1;
	var user_col  = 2;
	var cmb_col   = 4;
	var first_row = 4 + (start || 1);
	var last_row  = Math.min(ws_info.worksheets[0].rowCount, first_row + (count || 999));
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
};
