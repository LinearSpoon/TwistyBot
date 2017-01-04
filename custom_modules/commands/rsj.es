module.exports = async function(message, params) {
	if (params.length != 1)
	{
		throw Error('Usage: !rsj <player name>\n\nExamples:'
			+ '\n!rsj i rep wih\n!rsj tades');
	}

	var details = await apis.RSJustice.lookup(params[0], util.message_in(message, 'rsj_private_channels'));
	if (!details)
		return util.dm.code_block('Player not found.');

	return 'Player: ' + details.player +
		'\nPublished: ' + util.approximate_time(Date.now() - details.date_created) + ' ago' +
		'\nLast updated: ' + util.approximate_time(Date.now() - details.date_modified) + ' ago' +
		'\nDescription:  ' + details.reason +
		'\n' + util.dm.underline('Link') + ': ' + details.url;
		//\n' + util.dm.underline('RSOF link') + ': http://services.runescape.com/m=forum/users.ws?lookup=find&searchname=' + encodeURIComponent(details.player);
};
