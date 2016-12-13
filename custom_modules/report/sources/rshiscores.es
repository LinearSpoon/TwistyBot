// Loads the stats of each member
module.exports = async function(clan_list) {
	for(var i = 0; i < clan_list.length; i++)
	{
		var member = clan_list[i];
		try {
			console.log('RSHiscores:', member.id, member.name);
			member.rshiscores = await apis.RuneScape.lookup_player(member.name);
			if (member.rshiscores)
			{
				// Push to database
				await database.query('INSERT IGNORE INTO players SET name = ?; ' +
					'INSERT INTO hiscores_history SET ' +
					'player_id = (SELECT id FROM players WHERE name = ? LIMIT 1), ' +
					'timestamp = ?, hiscores = ?;', member.name, member.name, Date.now(), JSON.stringify(member.rshiscores));
			}
		} catch(e) {
			// Request error, wait a bit and retry
			console.warn('RSHS error during report: (' + member.name + ')' + e.message);
			i = i - 1;
		}

		// Always wait before sending another request
		await util.sleep(5000);
	}
	console.log('Loaded RSHiscores');
};
