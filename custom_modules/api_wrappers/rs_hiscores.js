var request = require('request');

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

module.exports = function(username) {
	var url = 'http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=' + encodeURIComponent(username);
	//console.log(url);
	return new Promise(function(resolve, reject) {
		request(url, function(err, res, body) {
			if (err)
				return reject(err);
			if (res.statusCode == 404)
				return reject(new Error('Player not found.'));
			if (res.statusCode != 200)
				return reject(new Error('Unknown HTML status code: ' + res.statusCode));

			// Request is good, now parse the response
			var data = body.split('\n');
			var skills = {};
			for(var i = 0; i < skills_order.length; i++)
			{
				var skill = data[i].split(',').map(e => parseInt(e));
				skills[skills_order[i]] = { rank: skill[0], level: skill[1], xp: skill[2] };
			}
			// Alternate common names...
			skills.defense = skills.defence;
			skills.range = skills.ranged;
			return resolve(skills);
		});
	});
};
