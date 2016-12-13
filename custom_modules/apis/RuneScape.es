var skills_order = [
	'overall',
	'attack',
	'defence',
	'strength',
	'hitpoints',
	'ranged',
	'prayer',
	'magic',
	'cooking',
	'woodcutting',
	'fletching',
	'fishing',
	'firemaking',
	'crafting',
	'smithing',
	'mining',
	'herblore',
	'agility',
	'thieving',
	'slayer',
	'farming',
	'runecrafting',
	'hunter',
	'construction'
];

module.exports.skills = skills_order;

// Returns promise
// if player exists => skills object
// if player doesn't exist => undefined
// other error => throw
module.exports.lookup_player = async function(username) {
	var url = 'http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=' + encodeURIComponent(username.replace(/[^a-zA-Z0-9 \-]/g,''));
	//console.log(url);
	var res = await util.request(url);
	if (res.statusCode == 404)
		return; // Player not found
	if (res.statusCode != 200)
		throw Error('Bad request (' + res.statusMessage + ')');

	var data = res.body.split('\n');
	var skills = {};
	for(var i = 0; i < skills_order.length; i++)
	{
		var skill = data[i].split(',').map(e => parseInt(e));
		skills[skills_order[i]] = { rank: skill[0], level: skill[1], xp: skill[2] };
	}
	// Alternate common names...
	skills.defense = skills.defence;
	skills.range = skills.ranged;
	return skills;
};

module.exports.combat_level = function(stats) {
	if (typeof stats === 'undefined')
		return 0;
	var base = 0.25 * Math.floor(stats.defence.level + stats.hitpoints.level + stats.prayer.level / 2 );
	var melee = base + 0.325 * (stats.attack.level + stats.strength.level);
	var range = base + 0.325 * Math.floor(1.5 * stats.ranged.level);
	var magic = base + 0.325 * Math.floor(1.5 * stats.magic.level);
	return +Math.max(melee, range, magic).toFixed(2);
};
