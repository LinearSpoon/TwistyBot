// http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Collection
var columnify = require('columnify');		// https://www.npmjs.com/package/columnify

var save = custom_require('save');
var players = custom_require('players');
var items = custom_require('items');





module.exports.commands = function(client, message, params)
{
	var commands = columnify([
		{ name: '!price', description: 'Retrieves price of items from RSBuddy.'},
		{ name: '!inactive', description: 'Retrieves inactive clanmates from CrystalMathLabs.'},
		{ name: '!update', description: 'Updates a single player on CrystalMathLabs.'},
		{ name: '!help', description: 'Display music commands.'},
	], {
		config: {
			name: { minWidth: 20 }
		}
	});
	message.split_channel_message(util.wrap_code(commands));
}

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



module.exports.longmsg = function(client, message, params)
{
	message.split_channel_message(Array(3000).join("a"));
}
