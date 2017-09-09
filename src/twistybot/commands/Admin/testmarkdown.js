module.exports.help = {
	description: 'Test markdown parser.',
	parameters: '<text>',
	details: 'Returns a JSON representation of the parsed text.'
};

module.exports.params = {
	min: 1,
	max: 1
};

module.exports.permissions = [
	{ user: '*', block: true }
];

module.exports.run = async function(params, options) {
	return Discord.json(twistybot.parsers.markdown(params[0]));
};
