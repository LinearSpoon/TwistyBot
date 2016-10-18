// TODO:
//
//


// http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Collection
var columnify = require('columnify');		// https://www.npmjs.com/package/columnify

var save = custom_require('save');
var players = custom_require('players');
var items = custom_require('items');
var GoogleSpreadsheet = require('google-spreadsheet');
var rs_hiscores = custom_require('api_wrappers/rs_hiscores');

function return_error(message, err)
{
	message.channel.sendMessage(util.wrap_code(err.message));
}


module.exports.test = function(client, message, params)
{
	var clan_splitlist_spreadsheet = new GoogleSpreadsheet('1N2fzS9Bd_BZ7EwzWbS8YRDGQipIo8DCDlHYmJUEmXAs');
	clan_splitlist_spreadsheet.useServiceAccountAuth(root_require('google_spreadsheet.json'), function(err, i) {
		if (err)
		{
			console.log(err);
			return;
		}
		clan_splitlist_spreadsheet.getInfo(function(err, info) {
				if (err)
				{
					console.log(err);
					return;
				}
	      console.log('Loaded doc: '+info.title+' by '+info.author.email);
	      sheet = info.worksheets[0];
	      console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
	    });

			//https://www.npmjs.com/package/google-spreadsheet
			//https://docs.google.com/spreadsheets/d/1N2fzS9Bd_BZ7EwzWbS8YRDGQipIo8DCDlHYmJUEmXAs/edit#gid=0
	});



};

module.exports.stats = function(client, message, params)
{
	if (params.length != 1)
	{
		return message.channel.sendMessage(util.wrap_code('Usage: !stats <username>\n\nExamples:'
			+ '\n!stats Twisty Fork\n!stats Vegakargdon'));
	}

	rs_hiscores(params[0])
		.then( function(stats) {
			var stat_array = [];
			for(var i in stats)
			{
				stat_array.push({
					skill: i,
					rank: stats[i].rank,
					level: stats[i].level,
					xp: stats[i].xp
				});
			}

			stat_array = stat_array.slice(0, -2);
			message.send_columns(stat_array, true, {
				skill: { minWidth: 14 },
				rank: { minWidth: 8, align: 'right' },
				level: { minWidth: 6, align: 'right' },
				xp: { minWidth: 11, align: 'right' },
			});
		})
		.catch( err => return_error(message, err));
};

module.exports.cb = function(client, message, params)
{
	if (params.length != 1)
	{
		return message.channel.sendMessage(util.wrap_code('Usage: !cb <username>\n\nExamples:'
			+ '\n!cb Twisty Fork\n!cb Vegakargdon'));
	}
	rs_hiscores(params[0])
		.then(function(stats) {
			console.log(stats);
			var base = 0.25 * Math.floor(stats.defence.level + stats.hitpoints.level + stats.prayer.level / 2 );
			var melee = base + 0.325 * (stats.attack.level + stats.strength.level);
			var range = base + 0.325 * Math.floor(1.5 * stats.ranged.level);
			var magic = base + 0.325 * Math.floor(1.5 * stats.magic.level);
			var final = Math.max(melee, range, magic).toFixed(2);
			message.send_columns({
				'Combat:': final,
				'Attack:': stats.attack.level,
				'Defense:': stats.defense.level,
				'Strength:': stats.strength.level,
				'Hitpoints:': stats.hitpoints.level,
				'Ranged:': stats.ranged.level,
				'Prayer:': stats.prayer.level,
				'Magic:': stats.magic.level
			}, false, { key: { minWidth:18 }, value: { align:'right' } });
		})
		.catch( err => return_error(message, err));
};


module.exports.commands = function(client, message, params)
{
	message.send_columns({
		'!price': 'Retrieves price of items from RSBuddy.',
		'!inactive': 'Retrieves inactive clanmates from CrystalMathLabs.',
		'!update': 'Updates a single player on CrystalMathLabs.',
		'!butter': 'Enable/disable butter messages.',
		'!stats': 'Display OldSchool player stats.',
		'!cb': 'Display OldSchool player combat stats.',
		'!help': 'Display music commands (only in the music channel).',
	}, false, { key: { minWidth: 15 } });
};

module.exports.price = function(client, message, params)
{
	if (params.length != 1)
	{
		return message.channel.sendMessage(util.wrap_code('Usage: !price <item>\n\nExamples:'
			+ '\n!price Cannonball\n!price ags\n!price zam hilt'));
	}

	var item = params[0];

	var id = items.get_item_id(item);
	if (!id)
	{ // Try fuzzy string search
		var guesses = items.get_similar_items(item).slice(0, 10);
		guesses = columnify(guesses, {
			showHeaders: true,
			config: {
				name: { minWidth: 24 },
				value: { align: 'right' }
			}
		});
		console.log(item, 'not found. Guesses:\n', guesses);

		return message.channel.sendMessage('Item not found! Are you looking for one of these?' + util.wrap_code(guesses));
	}

	// We have a valid item ID
	console.log('Looking up', item);
	return items.get_item_summary(id)
		.then( function(data) {
			var columns = columnify([
				{ name: "Overall Price:", value: util.format_number(data.overall), unit:"GP" },
				{ name: "Buying Price:", value: util.format_number(data.buying), unit:"GP" },
				{ name: "Amount Bought:", value: util.format_number(data.buyingQuantity), unit:"" },
				{ name: "Selling Price:", value: util.format_number(data.selling), unit:"GP" },
				{ name: "Amount Sold:", value: util.format_number(data.sellingQuantity), unit:"" },
			], {
				showHeaders: false,
				config: {
					name: { minWidth: 18 },
					value: { align: 'right' }
				}
			});
			message.channel.sendMessage(
				'Showing details for ' + items.get_item_proper_name(item) + ':' + util.wrap_code(columns)
			 	+ '__Graph:__ https://rsbuddy.com/exchange?id=' + id);
		})
		.catch( err => message.channel.sendMessage(util.wrap_code(err.message)) );
};


module.exports.get_clan_list = function(client, message, params)
{
	return players.get_clan_list()
		.then(function(list) {
			console.log(list);
			message.split_channel_message( util.wrap_code(list.join('\n')) );

		})
		.catch( err => message.channel.sendMessage(util.wrap_code(err.message)) );
};

module.exports.update = function(client, message, params)
{
	if (params.length != 1)
	{
		return message.channel.sendMessage(util.wrap_code('Usage: !update <player name>\n\nExamples:'
			+ '\n!update twisty fork\n!update vegakargdon'));
	}

	return players.update_player(params[0])
		.then( () => message.channel.sendMessage(util.wrap_code('Player successfully updated!')) )
		.catch( err => message.channel.sendMessage(util.wrap_code(err.message)) );
};

module.exports.inactive = function(client, message, params)
{
	if (params.length == 0)
		params[0] = '1209600';  // 2 weeks in seconds
	// Convert and validate
	var time_limit = parseInt(params[0]);
	if (isNaN(time_limit) || time_limit < 60)
		time_limit = 1209600;

	message.channel.sendMessage('Searching for inactive clanmates longer than ' + util.convert_seconds_to_time_str(time_limit)
		+ '.\nThis will take a few minutes...');

	var results = [];
	return players.get_clan_list()
		.then(function(list) {
			// Generates a function that loads player last update time
			function load_times(player_name) {
				return function() {
					return Promise.resolve()
					//	.then( () => players.update_player(player_name) )
						.then( () => util.sleep(600) )
						.then( () => players.player_last_change(player_name) )
						.then( function(time) {
							if (time > time_limit)
							{
								var to = util.convert_seconds_to_time_object(time);
								results.push({
									name:player_name,
									weeks: to.weeks,
									days: to.days,
									hours: to.hours,
									time: time
								});
							}
							console.log('OK:', player_name, time);
						})
						.catch( function(err) {
							console.log('error:', player_name, err.message);
							results.push({
								name:player_name,
								weeks:err.message,
								time:0xFFFFFFFFFFFF, // Just some big number to force the sort
							});
						})
				};
			}

			var p = Promise.resolve();
			for(var i = 0; i < list.length; i++)
			{
				p = p.then( load_times(list[i]) )
			}
			return p;
		})
		.then( function() {
			if (results.length == 0)
				return message.channel.sendMessage('Amazingly, nobody was found to be inactive. This is probably an error.');

			results.sort( (a,b) => b.time - a.time );
			var columns = columnify(results, {
				showHeaders: true,
				columns: [ 'name', 'weeks', 'days', 'hours' ],
				config: {
					name: { minWidth: 16 },
					weeks: { align: 'right', minWidth: 8, maxWidth: 30 },
					days: { align: 'right', minWidth: 8 },
					hours: { align: 'right', minWidth: 8 },
				}
			});
			message.split_channel_message(util.wrap_code(columns));
		})
		.catch( err => {
			message.channel.sendMessage(util.wrap_code(err.message))
		} );
};

module.exports.butter = function(client, message, params)
{
	if (params.length != 1)
	{
		return message.channel.sendMessage(util.wrap_code('Usage: !butter <on|off>'));
	}
	if (params[0] == 'on')
	{
		global.butter = true;
		return message.split_channel_message('Butter messages enabled.');
	}
	if (params[0] == 'off')
	{
		global.butter = false;
		return message.split_channel_message('Butter messages disabled.');
	}
};
