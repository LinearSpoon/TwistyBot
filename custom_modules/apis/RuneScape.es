var cheerio = require('cheerio');
var moment = require('moment-timezone');

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
	var url = 'http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=' + url_encode_username(username);
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


const forum_base = 'http://services.runescape.com/m=forum/'
module.exports.forum_profile = async function(username) {
	var url = forum_base + 'users.ws?lookup=view&searchname=' + url_encode_username(username);
	var selector = '#forums--userview > div > div.contents > main > section.threads-list > article';

	var body = await util.download( {url:url, encoding:'ascii'} );
	var $ = cheerio.load(body);
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

	posts.profile = url;
	posts.name = $('#searchname').val();
	posts.avatar = 'http://services.runescape.com/m=avatar-rs/' + url_encode_username(username) + '/chat.png'
	return posts;
}

function url_encode_username(username) {
	return encodeURIComponent(username.replace(/[^a-zA-Z0-9 \-_]/g,''));
}
