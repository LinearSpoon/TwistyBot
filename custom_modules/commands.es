

module.exports.inactive = async function(client, message, params)
{
	if (params.length == 0)
		params[0] = '1209600';  // 2 weeks in seconds
	// Convert and validate
	var time_limit = parseInt(params[0]);
	if (isNaN(time_limit) || time_limit < 60)
		time_limit = 1209600;

	message.channel.sendMessage('Searching for inactive clanmates longer than ' + util_old.convert_seconds_to_time_str(time_limit)
		+ '.\nThis will take a few minutes...');

	var results = [];
	return CrystalMathLabs.get_clan_list()
		.then(function(list) {
			// Generates a function that loads player last update time
			function load_times(player_name) {
				return function() {
					return Promise.resolve()
					//	.then( () => CrystalMathLabs.update_player(player_name) )
						.then( () => util_old.sleep(600) )
						.then( () => CrystalMathLabs.player_last_change(player_name) )
						.then( function(time) {
							if (time > time_limit)
							{
								var to = util_old.convert_seconds_to_time_object(time);
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
			message.split_channel_message(util_old.wrap_code(columns));
		})
		.catch( err => {
			message.channel.sendMessage(util_old.wrap_code(err.message))
		} );
};
