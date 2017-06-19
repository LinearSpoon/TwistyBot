// http://runewatch.com/wp-json/bot/discord?password=TG3Ut4wgBsGmNNAyJ4V4h9qRevGfE8bQaMhQ

var moment = require('moment-timezone');
module.exports.help = {
	name: 'rw',
	text: 'Lookup a player on RuneWatch.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 250,
	help:
`Usage: !rw <username>, <username>, ...

Note:
Usernames must be separated with commas. Up to 250 names can be run per command.
If you see a blank message from this command, you may have embeds disabled. Enable them at Settings->Text & Images->Link Preview.

Examples:
!rw i rep wih
!rw yente, tades, schlitz`
};
module.exports.permissions = [
	{ channel: '293451186848137237', block: true },
	{ user: '*' }
];

module.exports.command = async function(message, params) {
	params = params.filter( p => p.length < 15 );
	if (params.length == 0)
		return Discord.code_block('Username too long, try something shorter!'); // Don't waste time if the name is too long

	// Which posts do we care about?
	var post_types = ['publish'];

	// Lookup every player
	var players = await Promise.all(params.map( p => apis.RuneWatch.find(p, post_types) ));

	if (players.length == 1)
	{ // Single player lookup, we can afford to be fancy
		if (players[0].length == 0)
		{ // If player was not found, try to find close matches
			var possible_names = await apis.RuneWatch.find_similar(params[0], post_types);
			if (possible_names.length == 0)
				return 'Player not found!';

			return 'Player not found! Here are some similar names:\n' +
				Discord.code_block(
					'Name               Score\n' +
					possible_names.map(e => util.printf('%-18s %5d', e.name, e.score)).join('\n')
				);
		}

		return players[0].map( p => get_embed(p, message) );
	}
	// else, we are looking up a list of players
	var response = '';
	for(var i = 0; i < players.length; i++)
	{
		players[i].forEach(function(post) {
			response += params[i] + ': ' + Discord.link(post.url) + '\n';
		});
	}
	return response.length == 0 ? 'No matching cases found!' : response;
};

function get_embed(details, message)
{
	var e = new Discord.RichEmbed();
	e.setColor(0x87CEEB);
	e.setAuthor('Current name: ' + details.player);
	e.setDescription(details.reason);
	e.addField('Published:', util.approximate_time(details.date_created, new Date()) + ' ago', true);
	e.addField('Last updated:', util.approximate_time(details.date_modified, new Date()) + ' ago', true);
	e.addField('Link:', details.url);
	if (details.previous_names.length)
		e.addField('Previous names:', details.previous_names.join('\n'));

	if (message.guild && message.guild.id == '232274245848137728')
	{
		e.addField('Status:', details.status, true);
		e.addField('ID:', details.id, true);
	}
	return e;
}
