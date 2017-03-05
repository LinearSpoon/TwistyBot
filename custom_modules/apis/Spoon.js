module.exports.get_item_stats = async function(name)
{
	var rows = await database.query('SELECT * FROM runescape.items WHERE name = ?;', name);
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
