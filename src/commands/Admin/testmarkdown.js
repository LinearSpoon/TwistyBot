module.exports.help = {
	description: 'Test markdown parser.',
	parameters: '<text>',
	details: 'Returns a JSON representation of the parsed text.'
};

module.exports.params = {
	max: 1
};

module.exports.permissions = [
	{ user: '*', block: true }
];


let mp = src_require('parsers/markdown');
module.exports.run = async function(params, options) {
	return Discord.json(mp(params[0]));
};
