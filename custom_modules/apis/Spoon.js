module.exports.get_item_stats = async function(name)
{
	var rows = await database.query('SELECT * FROM items WHERE name = ?;', name);
	if (rows.length == 0)
		return null;
	if (rows.length > 1)
		console.warn('Item', name, 'returned more than one row!');

	var i = rows[0];

	return {
		name: i.name,
		prayer: i.prayer,
		speed: i.speed,
		slot: i.slot,

		attack: {
			stab: i.stab_att,
			slash: i.slash_att,
			crush: i.crush_att,
			magic: i.magic_att,
			range: i.range_att,
		},
		defence: {
			stab: i.stab_def,
			slash: i.slash_def,
			crush: i.crush_def,
			magic: i.magic_def,
			range: i.range_def,
		},
		strength: {
			melee: i.melee_str,
			magic: i.magic_str,
			range: i.range_str
		}
	};
};

module.exports.load_player_exp_history = async function(username) {
	var results = await database.query('SELECT * FROM hiscores_history WHERE player_id = (SELECT id FROM players WHERE name = ?) order by timestamp desc;', username);
	return results.map(function(row) {
		var skills = {};
		for(var i in apis.RuneScape.skills)
		{

			var s = apis.RuneScape.skills[i];
			skills[s] = {
				xp: row[s + '_exp'],
				level: row[s + '_level'],
				rank: row[s + '_rank']
			};
		}
		return {
			timestamp: row.timestamp,
			skills: skills
		};
	});
};

module.exports.save_player_exp_history = async function(username, skills) {
	var history = { timestamp: Date.now() };
	for(var i in apis.RuneScape.skills)
	{
		var s = apis.RuneScape.skills[i];
		history[s + '_exp'] = skills[s].xp;
		history[s + '_level'] = skills[s].level;
		history[s + '_rank'] = skills[s].rank;
	}

	await database.query(
		`INSERT IGNORE INTO players SET name = ?;
			INSERT INTO hiscores_history SET
			player_id = (SELECT id FROM players WHERE name = ? LIMIT 1), ?;`,
		username,
		username,
		history
	);
};
