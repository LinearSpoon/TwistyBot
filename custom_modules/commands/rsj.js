const Discord = require('discord.js');

module.exports.help = {
	name: 'rsj',
	text: 'Lookup a player on RS Justice.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 250,
	help:
`Usage: !rsj <username>, <username>, ...

Note:
Usernames must be separated with commas. Up to 250 names can be run per command.
If you see a blank message from this command, you may have embeds disabled. Enable them at Settings->Text & Images->Link Preview.

Examples:
!rsj i rep wih
!rsj yente, tades, schlitz`
};
module.exports.permissions = [
	{ user: '*' }
];

module.exports.command = async function(client, message, params) {
	params = params.filter( p => p.length < 15 );
	if (params.length == 0)
		return Discord.code_block('Username too long, try something shorter!'); // Don't waste time if the name is too long

	var include_private = message.check_permissions([
		{ channel: ['266095695860203520', '230201497302859776'] }, // RS JUSTICE.name-checks, RS JUSTICE.private
		{ guild: '232274245848137728' }, // Twisty-Test
		{ user: ['189803024611278849', '217934790886686730'] }, // Zeal, Twisty Fork
	]);

	// Lookup every player
	var players = await Promise.all(params.map( p => apis.RSJustice.lookup(p, include_private) ));

	if (players.length == 1)
	{ // Single player lookup, we can afford to be fancy
		if (players[0].length == 0)
		{
			// Check for close matches
			var possible_names = apis.RSJustice.get_similar_names(params[0], include_private);
			if (possible_names.length == 0)
				return send_response_to_zeal('Player not found!', message, params);

			return send_response_to_zeal('Player not found! Here are some similar names:\n' +
				Discord.code_block(
					'Name               Score\n' +
					possible_names.map(e => util.printf('%-18s %5d', e.name, e.score)).join('\n')
				), message, params);
		}

		return send_response_to_zeal(players[0].map( p => get_embed(p, message) ), message, params);
	}
	// else, we are looking up a list of players
	players = players.filter( e => e.length > 0 ); // Remove players not found
	if (players.length == 0)
		return send_response_to_zeal('No matching cases found!', message, params);

	var response = players.map( e => e.map( f => e.searched_name + ': ' + Discord.link(f.url) ).join('\n') ).join('\n');
	return send_response_to_zeal(response, message, params);
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

	if (message.channel.guild && message.channel.guild.id == '232274245848137728')
	{
		e.addField('Status:', details.status, true);
		e.addField('ID:', details.id, true);
	}
	return e;
}

function send_response_to_zeal(response, message, params)
{
	var sender = '[' + message.channel.get_name() + '] ' + message.author.username + ': !rsj ' + params.join(',') + '\n';
	var Zeal_dm = Discord.bot.get_text_channel('RS JUSTICE.global-usage');
	if (Array.isArray(response))
	{
		for(var i = 0; i < response.length; i++)
			Zeal_dm.sendEmbed(response[i], i == 0 ? sender : undefined);
	}
	else
	{
		Zeal_dm.sendmsg(sender + response);
	}

	return response;
}
