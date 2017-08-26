module.exports.help = {
	description: `Send a plain text message.`,
	usage: `Usage: !testmarkdown`
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
