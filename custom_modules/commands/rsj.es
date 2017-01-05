module.exports = async function(message, params) {
	if (params.length != 1)
	{
		throw Error('Usage: !rsj <player name>\n\nExamples:'
			+ '\n!rsj i rep wih\n!rsj tades');
	}

	var name = params[0];
	var include_private = util.message_in(message, 'rsj_private_channels');

	var details = await apis.RSJustice.lookup(name, include_private);
	if (!details)
	{
		return 'Player not found! Are you looking for one of these fine individuals?\n' +
			util.dm.code_block(
				'Name               Score\n' +
				apis.RSJustice.get_similar_names(name, include_private).map(e => util.printf('%-18s %5d', e.name, e.score)).join('\n')
			);
	}

	return 'Player: ' + details.player +
		'\nPublished: ' + util.approximate_time(Date.now() - details.date_created) + ' ago' +
		'\nLast updated: ' + util.approximate_time(Date.now() - details.date_modified) + ' ago' +
		'\nDescription:  ' + details.reason +
		'\n' + util.dm.underline('Link') + ': ' + details.url;
		//\n' + util.dm.underline('RSOF link') + ': http://services.runescape.com/m=forum/users.ws?lookup=find&searchname=' + encodeURIComponent(details.player);
};
