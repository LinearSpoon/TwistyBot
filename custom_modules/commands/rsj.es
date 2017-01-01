module.exports = async function(message, params) {
	if (params.length != 1)
	{
		throw Error('Usage: !rsj <player name>\n\nExamples:'
			+ '\n!rsj i rep wih\n!rsj tades');
	}

	var details = await apis.RSJustice.lookup(params[0]);
	if (!details)
		throw Error('Player not found.'); // lazy

	return 'Player: ' + details.player +
		'\nReason: ' + details.reason +
		'\nDetail: ' + details.url;
};
