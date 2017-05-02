var moment = require('moment-timezone');
module.exports.help = {
	name: 'rsj',
	text: 'Lookup a player on RS Justice.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 250,
	help:
`TwistyBot can no longer provide !rsj. Please use the RS Justice website for your search.`
	/*
`Usage: !rsj <username>, <username>, ...

Note:
Usernames must be separated with commas. Up to 250 names can be run per command.
If you see a blank message from this command, you may have embeds disabled. Enable them at Settings->Text & Images->Link Preview.

Examples:
!rsj i rep wih
!rsj yente, tades, schlitz`
*/
};
module.exports.permissions = [
	{ user: '*' }
];

module.exports.command = async function(message, params) {
	return 'Zeal (Leader of RS Justice) has asked that TwistyBot no longer return cases from RS Justice.' +
		'I am open to working with RS Justice again in the future to bring this command back, but for now please use the ' +
		 Discord.link("http://rsjustice.com/") + ' website for your search.\n\nhttp://i.imgur.com/EUbbBuh.png';

	params = params.filter( p => p.length < 15 );
	if (params.length == 0)
		return Discord.code_block('Username too long, try something shorter!'); // Don't waste time if the name is too long

	// Which posts do we care about?
	var post_types = ['publish'];
	if (message.check_permissions([
			{ channel: ['266095695860203520', '230201497302859776'] }, // RS JUSTICE.name-checks, RS JUSTICE.private
			{ guild: '232274245848137728' }, // Twisty-Test
			{ user: ['217934790886686730', '189803024611278849'] }, // Zeal, Twisty Fork
		]))
	{
		post_types.push('private');
	}

	// Lookup every player
	var players = await Promise.all(params.map( p => apis.RSJustice.find(p, post_types) ));

	if (players.length == 1)
	{ // Single player lookup, we can afford to be fancy
		if (players[0].length == 0)
		{ // If player was not found, try to find close matches
			var possible_names = await apis.RSJustice.find_similar(params[0], post_types);
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
	const dateformat = 'MMMM D, YYYY';
	var e = new Discord.RichEmbed();
	e.setColor(0x87CEEB);
	e.setAuthor(details.reason);
	if (details.custom.excerpt)
		e.setDescription(details.custom.excerpt[0]);

	var case_details = '';
	// Accused names
	case_details += '• Current name - ' + details.player + '\n';
	if (details.custom.NATA)
		case_details += '• Name at time of abuse - ' + details.custom.NATA[0] + '\n';
	if (details.previous_names.length)
		case_details += '• Previous names - ' + details.previous_names.join(', ') + '\n';
	e.addField('Accused Player:', case_details);

	// Dates
	case_details = '';
	if (details.custom.date)
		case_details += '• Date of abuse - ' + moment(details.custom.date[0], 'YYYY/MM/DD').format(dateformat) + '\n';
	case_details += '• Date published - ' + moment(details.date_created).format(dateformat) + ' (' + util.approximate_time(details.date_created, new Date()) + ' ago)\n';
	case_details += '• Last updated - ' + moment(details.date_modified).format(dateformat) + ' (' + util.approximate_time(details.date_modified, new Date()) + ' ago)';

	e.addField('Timeline:', case_details);

	case_details = '';
	if (details.custom.clan)
		case_details += '• Clan - ' + details.custom.clan.join(',') + '\n';
	if (details.custom.author)
		case_details += '• Author - ' + details.custom.author.join(',') + '\n';
	if (details.custom.victim)
		case_details += '• Victims - ' + details.custom.victim.join(',') + '\n';
	case_details += '• Status - ' + (details.status == 'publish' ? 'public' : details.status) + '\n';
	if (message.guild && message.guild.id == '232274245848137728')
		case_details += '• ID - ' + details.id + '\n';

	case_details += '\n\n' + details.url;


	e.addField('Other Details:', case_details);

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
