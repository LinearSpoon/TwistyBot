module.exports.help = {
	name: 'test',
	text: 'A test command.',
	category: 'Admin'
};
module.exports.params = {
	min: 0,
	max: 11111,
	help: `Usage: !test`
};
module.exports.permissions = [];

var Table = require('cli-table2');

var moment = require('moment-timezone');
module.exports.command = async function(message, params) {
	return Discord.bot.guilds.find('name', 'Deities of PvM').members
		.array()
		.sort( (a,b) => a.joinedTimestamp - b.joinedTimestamp )
		.map(function(member) {
			return member.nickname + '\t' + member.user.tag + '\t' + member.id + '\t' + moment(member.joinedAt).format('YYYY-MM-DD');
		})
		.join('\r\n');


};



/*
	var r = '';
	for(var i in apis.RSJustice.cache)
	{
		var this_post = apis.RSJustice.cache[i];
		r += this_post.player + '\t' + this_post.url + '\t' + this_post.reason.replace(/[\r\n]+/g,' ') + '\t' + this_post.status + '\n';
	}

	await util.save_file('rsj.txt', r);
*/
/*
	id: post.id,
	url: 'http://rsjustice.com/' + post.link,
	player: post.title,
	reason: post.reason.replace(/&amp;/g, '&'),
	date_created: new Date(post.date + 'Z'),
	date_modified: new Date(post.modified + 'Z'),
	status: post.status, // 'publish' || 'private'
	previous_names: post.tags
		.filter(e => to_searchable_name(e) != search_name), // Remove current name
	_name: search_name,
	_previous_names: search_tags,
*/
