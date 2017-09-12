module.exports.help = {
	description: 'Test markdown parser.',
	parameters: '<text>',
	details: 'Returns a JSON representation of the parsed text.'
};

module.exports.params = {
	parser: 'raw'
};

module.exports.permissions = [
	{ user: '*', block: true }
];

module.exports.run = async function(twistybot, params, options) {
	return Discord.json(twistybot.parsers.markdown(params));
};
