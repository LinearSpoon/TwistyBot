// Loads the stats of each member
module.exports = async function(clan_list) {
	for(var i = 0; i < clan_list.length; i++)
	{
		var member = clan_list[i];
		try {
			console.log('RSHiscores:', member.id, member.name);
			var hiscores = await apis.RuneScape.lookup_player(member.name, { max_attempts: 100 });
			if (hiscores)
			{
				// Push to database
				await database.query('INSERT IGNORE INTO players SET name = ?; ' +
					'INSERT INTO hiscores_history SET ' +
					'player_id = (SELECT id FROM players WHERE name = ? LIMIT 1), ' +
					'timestamp = ?, hiscores = ?;', member.name, member.name, Date.now(), JSON.stringify(hiscores));
			}
		} catch(e) {
			console.warn('RSHS error during report: (' + member.name + ')' + e.message);
		}
	}
	console.log('Loaded RSHiscores');
};
