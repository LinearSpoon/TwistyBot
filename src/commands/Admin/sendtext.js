module.exports.help = {
	description: `Send a plain text message.`,
	usage: `Usage: !sendtext`
};

module.exports.params = {
	max: 1
};

module.exports.permissions = [
	{ user: '*', block: true }
];

module.exports.run = async function(message, params, options) {
	return params[0] || 'Test';
};
