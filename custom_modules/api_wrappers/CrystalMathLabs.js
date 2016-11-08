// CML api: https://crystalmathlabs.com/tracker/api.php

function check_cml_error(data)
{
	var err = parseInt(data);
	if (isNaN(err))
		return; // No problem
	if (err == -1)
		throw Error('CML error: User not in database');
	if (err == -2)
		throw Error('CML error: Invalid username');
	if (err == -3)
		throw Error('CML error: Database error');
	if (err == -4)
		throw Error('CML error: Server under heavy load; api temporarily disabled');
	if (err < 0)
		throw Error('CML error: Unknown error');
}

// https://crystalmathlabs.com/tracker/api.php?type=virtualhiscores&groupid=<group_id>&count=<n>&pagenum=<n>
module.exports.get_clan_list = function()
{
	return util.download('https://crystalmathlabs.com/tracker/api.php?type=virtualhiscores&groupid=' + config.get('cml_clan_id') + '&count=999')
		.then(function(data) {
			check_cml_error(data);
			// data is a string of forrmat: name1,totalxp1 name2,totalxp2 ...
			return data.slice(0,-1).split('\n').map(e => e.split(',')[0]);
		});
};

// https://crystalmathlabs.com/tracker/api.php?type=update&player=<name>
module.exports.update_player = function(player_name)
{
	player_name = player_name.replace(/[^a-zA-Z\d]/g, '_');  // Replace spaces/etc with underscore
	return util.download('https://crystalmathlabs.com/tracker/api.php?type=update&player=' + player_name)
		.then(function(data) {
			check_cml_error(data);
			// Check errors specific to this endpoint
			if (data == '2')
				throw Error('CML error: Player not on RuneScape hiscores. (' + player_name + ')');
			if (data == '3')
				throw Error('CML error: Negative XP gain detected. (' + player_name + ')');
			if (data == '4')
				throw Error('CML error: Unknown error. (' + player_name + ')');
			if (data == '5')
				throw Error('CML error: This player has been updated within the last 30 seconds. (' + player_name + ')');
			if (data == '6')
				throw Error('CML error: The player name was invalid. (' + player_name + ')');
		});
};

// https://crystalmathlabs.com/tracker/api.php?type=lastchange&player=<name>
module.exports.player_last_change = function(player_name)
{
	player_name = player_name.replace(/[^a-zA-Z\d]/g, '_');  // Replace spaces/etc with underscore
	return util.download('https://crystalmathlabs.com/tracker/api.php?type=lastchange&player=' + player_name)
		.then(function(data) {
			check_cml_error(data);
			// Try to parse the time
			var ret = parseInt(data);
			if (isNaN(ret))
			{
				console.warn('player_last_change', data);
				throw Error('Could not parse CML response');
			}
			return ret;
		});
};
