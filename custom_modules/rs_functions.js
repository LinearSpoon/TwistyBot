module.exports.combat_level = function(stats)
{
	var base = 0.25 * Math.floor(stats.defence.level + stats.hitpoints.level + stats.prayer.level / 2 );
	var melee = base + 0.325 * (stats.attack.level + stats.strength.level);
	var range = base + 0.325 * Math.floor(1.5 * stats.ranged.level);
	var magic = base + 0.325 * Math.floor(1.5 * stats.magic.level);
	return Math.max(melee, range, magic).toFixed(2);
}
