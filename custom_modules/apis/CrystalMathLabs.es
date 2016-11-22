// CML api: https://crystalmathlabs.com/tracker/api.php
async function cml_download(url)
{
	var res = await util.request(url);
	// Should check status here, but CML doesn't always return 200 when the request is OK
	// statusCode 500 == CML error -4
	console.log('CML status:', res.statusCode)
	if (res.body == '-1')
		throw Error('CML error: User not in database');
	if (res.body == '-2')
		throw Error('CML error: Invalid username');
	if (res.body == '-3')
		throw Error('CML error: Database error');
	if (res.body == '-4')
		throw Error('CML error: Server under heavy load; api temporarily disabled');
	return res.body; // Probably no problems
}

function format_player_name(player_name)
{
	return player_name.replace(/[^a-zA-Z\d]/g, '_');  // Replace spaces/etc with underscore
}

// https://crystalmathlabs.com/tracker/api.php?type=virtualhiscores&groupid=<group_id>&count=<n>&pagenum=<n>
module.exports.get_clan_list = async function()
{
	var data = await cml_download('https://crystalmathlabs.com/tracker/api.php?type=virtualhiscores&groupid=' + config.get('cml_clan_id') + '&count=999');
	// data is a string of format: name1,totalxp1 name2,totalxp2 ...
	return data.slice(0,-1).split('\n').map(e => e.split(',')[0]);
};

// https://crystalmathlabs.com/tracker/api.php?type=update
module.exports.update_player = async function(player_name)
{
	var data = await cml_download('https://crystalmathlabs.com/tracker/api.php?type=update&player=' + format_player_name(player_name));

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
};

// https://crystalmathlabs.com/tracker/api.php?type=lastchange
module.exports.player_last_change = async function(player_name)
{
	var data = await cml_download('https://crystalmathlabs.com/tracker/api.php?type=lastchange&player=' + format_player_name(player_name));
	// Try to parse the time
	var ret = Number(data);
	if (isNaN(ret))
	{
		console.warn('player_last_change', data);
		throw Error('Could not parse CML response.');
	}
	return ret;
};

// https://crystalmathlabs.com/tracker/api.php?type=ttm
module.exports.time_to_max = async function(player_name)
{
	var url = 'https://crystalmathlabs.com/tracker/api.php?type=ttm&player=' + format_player_name(player_name);
	return await cml_download(url);
};
