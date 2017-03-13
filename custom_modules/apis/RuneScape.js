var cheerio = require('cheerio');
var moment = require('moment-timezone');

const skills_order = [
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
module.exports.lookup_player = async function(username, request_options) {
	var url = 'http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=' + url_encode_username(username);

	// Set acceptable status codes
	if (!request_options)
		request_options = {};
	request_options.codes = [404, 200];

	var res = await util.queue_request(url, request_options);
	if (res.statusCode == 404)
		return; // Player not found

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

	// It seems that banned players stay on the hiscores but are unranked in everything except clue scrolls
	// So check to see if they are ranked in something before returning
	for(var i in skills)
		if (skills[i].rank != -1)
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

module.exports.forum_profile = async function(username, request_options) {
	const forum_base = 'http://services.runescape.com/m=forum/';
	var url = forum_base + 'users.ws?lookup=view&searchname=' + url_encode_username(username);
	var selector = '#forums--userview > div > div.contents > main > section.threads-list > article';

	var res = await util.queue_request({url:url, encoding:'ascii'}, request_options);
	var $ = cheerio.load(res.body);
	var posts = [];
	$(selector).each(function(i, e) {
		posts.push({
			section: $(e).find('div.thread-plate__details > p > a.thread-plate__forum-name').text(),
			thread: $(e).find('div.thread-plate__details > h3 > a').text(),
			date: moment.tz($(e).find('a.thread-plate__last-posted').text(), 'DD-MMM-YYYY HH:mm:ss', 'Europe/London').toDate(),
			thread_link: forum_base + $(e).find('div.thread-plate__details > h3 > a').attr('href'),
			showuser_link: forum_base + $(e).find('a.thread-plate__post-by-user').attr('href').replace('%A0','%20'),
		});
	});

	posts = posts.sort( (a,b) => b.date - a.date );

	posts.profile = url;
	posts.name = $('#searchname').val();
	posts.avatar = 'http://services.runescape.com/m=avatar-rs/' + url_encode_username(username) + '/chat.png';
	return posts;
}

function url_encode_username(username) {
	return encodeURIComponent(username.replace(/[^a-zA-Z0-9 \-_]/g,''));
}

/*
  Below code is modified from https://crystalmathlabs.com/tracker/suppliescalc.php
*/

// OSRS Main
const RATES = [	0, // Overall
	[0,15000,	37224,38000,	100000,55000,	1000000,65000,	1986068,82000,	3000000,95000,	5346332,115000,	13034431,150000], // Attack
	[0,350000], // Defence
	[0,15000,	37224,38000,	100000,55000,	1000000,65000,	1986068,82000,	3000000,95000,	5346332,115000,	13034431,150000], // Strength
	0, // Hitpoints
	[0,250000,	6517253,330000,	13034431,900000], // Ranged
	[0,625000], // Prayer
	[0,250000], // Magic
	[0,40000,	7842,130000,	37224,175000,	737627,490000], // Cooking
	[0,7000,	2411,16000,	13363,35000,	41171,49000,	302288,100000,	737627,129000,	1986068,141000,	5902831,153000,	13034431,165000], // Woodcutting
	[0,30000,	969,45000,	33648,150000,	50339,250000,	150872,500000,	302288,700000,	13034431,850000], // Fletching
	[0,14000,	4470,30000,	13363,40000,	273742,65000,	737627,75000,	2421087,88000,	5902831,90000,	10692629,100000,	13034431,110000], // Fishing
	[0,45000,	13363,132750,	61512,199125,	273742,298687,	1210421,448105,	5346332,516250], // Firemaking
	[0,57000,	300000,170000,	362000,285000,	496254,336875,	2951373,425000], // Crafting
	[0,40000,	37224,300000], // Smithing
	[0,8000,	14833,20000,	41171,44000,	302288,60000,	547953,75000,	1986068,90000,	5902831,105000,	13034431,117000], // Mining
	[0,60000,	27473,200000,	2192818,425000], // Herblore
	[0,6000,	13363,15000,	41171,44000,	449428,50000,	2192818,55000,	6000000,59000,	11000000,67000], // Agility
	[0,15000,	61512,60000,	166636,100000,	449428,220000,	5902831,255000,	13034431,270000], // Thieving
	[0,5000,	37224,12000,	100000,17000,	1000000,25000,	1986068,30000,	3000000,32500,	7195629,36000,	13034431,75000], // Slayer
	[0,10000,	2411,50000,	13363,80000,	61512,150000,	273742,350000,	1210421,1100000], // Farming
	[0,8000,	2107,20000,	101333,45000,	1210421,68500], // Runecrafting
	[0,5000,	12031,40000,	247886,80000,	1986068,115000,	3972294,135000,	6517253,150000,	13034431,175000], // Hunter
	[0,20000,	18247,100000,	123660,875000] // Construction
];

function prepare(tc) {
	var xp = tc.xp;
	var target_xp = tc.target_xp;

	// fm from wc
	tc.target_xp_mod[12] = Math.min(target_xp, target_xp - ((target_xp - Math.max(302288, xp[9])) * 0.2009));

	// smithing from mining
	tc.target_xp_mod[14] = Math.min(target_xp, target_xp - ((target_xp - Math.max(302288, xp[15])) * 0.08));

	if(xp[11] < target_xp) { // fishing
		xp[17] += (target_xp - Math.max(83014, xp[11])) / 11.0; // agil from fish
		xp[3] += (target_xp - Math.max(83014, xp[11])) / 11.0; // strength from fish
	}


	if(xp[9] < target_xp) { // woodcutting
		xp[10] += (target_xp - xp[9]) * 1.0; // fletching from woodcutting
		xp[7] += (target_xp - xp[9]) * 0.15; // magic from woodcutting
	}

	if(xp[17] < tc.target(17)) { // agility
		xp[10] += (tc.target(17) - xp[17]) * 0.5; // fletching from agility
		xp[7] += (tc.target(17) - xp[17]) * 0.25; // magic from agility
	}

	if(xp[18] < target_xp) { // thieving
		xp[7] += (target_xp - xp[18]) * 0.04; // magic from thieving
	}

	if(xp[15] < tc.target(15)) { // mining
		xp[7] += (tc.target(15) - xp[15]) * 0.15; // magic from mining
	}

	var bonus_melee = 0;
	if(xp[19] < target_xp) { // slayer
		var pre93 = Math.min(7195629, target_xp) - Math.min(7195629, xp[19]);
		var post93 = target_xp - Math.max(7195629, xp[19])

		xp[5] += pre93 * 1.25; // ranged from slayer
		bonus_melee += pre93 * 2.25; // melee from slayer
		xp[7] += pre93 * 0.35; // magic from slayer

		xp[5] += post93 * 0.4; // ranged from slayer
		bonus_melee += post93 * 0.47; // melee from slayer
		xp[7] += post93 * 1.0; // magic from slayer
		xp[2] += post93 * 0.88; // def from slayer
	}

	[1, 3, 2].forEach(function(s) {
		var needed = target_xp - xp[s];
		var used = Math.min(needed, bonus_melee);
		xp[s] += used;
		bonus_melee -= used;
	});

	if(xp[2] < target_xp) { // def
		xp[5] += (target_xp - xp[2]); // ranged from def
	}
}

// xp is xp array in the same order as skills_order (the order returned by official hiscores API)
module.exports.calculate_time = function(xp, target_xp) {
	// Don't want to modify prepare function, so fake a TimeCalculation object for it
	var tction = { xp, target_xp, target_xp_mod: {} };
	tction.target = i => tction.target_xp_mod[i] || target_xp;
	prepare(tction);

	// Save times for each skill in an object indexed by skill name
	var skill_times = { overall: 0 };
	for(var i = 1; i < RATES.length; i++)
	{
		var skill_name = skills_order[i];
		var current_skill_rates = RATES[i];
		var current_skill_xp = tction.xp[i];

		var xp_goal = tction.target_xp_mod[i] || target_xp;
		skill_times[skill_name] = 0;

		// If we still need to gain xp
		if (current_skill_xp < xp_goal && current_skill_rates)
		{
			// For each tier of rates
			for(var n = 0; n < current_skill_rates.length; n += 2)
			{
				// Calculate xp needed to next rate tier
				var target = current_skill_rates[n + 2] || xp_goal;
				var rate = current_skill_rates[n + 1];

				if(target > current_skill_xp)
				{
					if (rate > 0)
						skill_times[skill_name] += (target - current_skill_xp) / rate;
					current_skill_xp = target;
				}
			}
		}

		// Add to overall time left
		skill_times.overall += skill_times[skill_name];
	}

	return skill_times;
}

module.exports.max_ehp = module.exports.calculate_time(RATES.map(r => 0), 200000000);
