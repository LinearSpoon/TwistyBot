module.exports.help = {
	description: 'Send a plain text message.',
	parameters: '<text>',
	details: ''
};

module.exports.params = {
	parser: 'raw'
};

module.exports.permissions = [
	{ user: '*', block: true }
];

module.exports.run = async function(twistybot, params, options) {
	return params || 'Test';
};
