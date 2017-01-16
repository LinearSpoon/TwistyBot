// Loads the stats of each member
module.exports = async function(clan_list) {
	var failed_lookups = 0;

	for(var i = 0; i < clan_list.length; i++)
	{
		var member = clan_list[i];
		try {
			console.log('RSHiscores:', member.id, member.name);
			var hiscores = await apis.RuneScape.lookup_player(member.name);
			if (hiscores)
			{
				// Push to database
				await database.query('INSERT IGNORE INTO players SET name = ?; ' +
					'INSERT INTO hiscores_history SET ' +
					'player_id = (SELECT id FROM players WHERE name = ? LIMIT 1), ' +
					'timestamp = ?, hiscores = ?;', member.name, member.name, Date.now(), JSON.stringify(hiscores));
			}
			failed_lookups = 0;
		} catch(e) {
			// Request error, wait a bit and retry
			console.warn('RSHS error during report: (' + member.name + ')' + e.message);
			i -= 1;	failed_lookups += 1;
		}

		// Always wait before sending another request
		if (failed_lookups > 3)
		{ // Wait longer if we fail too many times
			failed_lookups = 0;
			await util.sleep(60000);
		}
		else
		{
			await util.sleep(5000);
		}
	}
	console.log('Loaded RSHiscores');
};
