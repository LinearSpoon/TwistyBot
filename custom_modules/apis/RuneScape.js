var cheerio = require('cheerio');
var moment = require('moment-timezone');

var experience_table = root_require('data/experience_table');

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
module.exports.experience_table = experience_table;

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

module.exports.exp_to_level = function(exp) {
	var lvl = first_greater_than(exp, experience_table) + 1;
	if (lvl == 0 || lvl > 99) // exp is very high
		return 99;

	return lvl;
};

module.exports.exp_to_virtual_level = function(exp) {
	var lvl = first_greater_than(exp, experience_table) + 1;
	if (lvl == 0) // exp is very high
		return 200;

	return lvl;
};

// Binary search of sorted_array for index of first element greater than v
function first_greater_than(v, sorted_array)
{
	var min = 0; var max = sorted_array.length - 1;
	var best = sorted_array.length;
	while(min <= max)
	{
		mid = (min+max) / 2 | 0;
		if (sorted_array[mid] > v)
		{ // mid is the answer or something left of mid
			if (mid < best)
				best = mid;
			max = mid - 1;
		}
		else
		{ // right of mid is the answer
			min = mid + 1;
		}
	}

	return best == sorted_array.length ? -1 : best;
}


// xp is xp array in the same order as skills_order (the order returned by official hiscores API)
function do_ttm_calculation(xp, target_xp, data) {
	// Don't want to modify prepare function, so fake a TimeCalculation object for it
	var tction = { xp, target_xp, target_xp_mod: {} };
	tction.target = i => tction.target_xp_mod[i] || target_xp;
	data.prepare(tction);

	// Save times for each skill in an object indexed by skill name
	var skill_times = { overall: 0 };
	for(var i = 1; i < data.rates.length; i++)
	{
		var skill_name = skills_order[i];
		var current_skill_rates = data.rates[i];
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
				var target = Math.min(current_skill_rates[n + 2] || xp_goal, xp_goal);
				var rate = current_skill_rates[n + 1];

				if(target > current_skill_xp)
				{
					if (rate > 0)
					{
						console.log('current:', current_skill_xp, 'target:' + target, 'rate:', rate);
						console.log('Add ' + ((target - current_skill_xp) / rate) + ' to ' + skill_name);
						skill_times[skill_name] += (target - current_skill_xp) / rate;
					}
					current_skill_xp = target;
				}
			}
		}

		// Add to overall time left
		skill_times.overall += skill_times[skill_name];
	}

	return skill_times;
}

module.exports.ehp = {
	main: {
		calculate: (stats, target) => do_ttm_calculation(skills_order.map(i => stats[i].xp), target, custom_require('ehp/main')),
		max: do_ttm_calculation(skills_order.map(r => 0), 200000000, custom_require('ehp/main'))
	},
	iron: {
		calculate: (stats, target) => do_ttm_calculation(skills_order.map(i => stats[i].xp), target, custom_require('ehp/iron')),
		max: do_ttm_calculation(skills_order.map(r => 0), 200000000, custom_require('ehp/iron')),
	},
};
