module.exports.help = {
	description: 'Send a plain text message.',
	parameters: '<text>',
	details: ''
};

module.exports.params = {
	max: 1
};

module.exports.permissions = [
	{ user: '*', block: true }
];

module.exports.run = async function(params, options) {
	for(let i =0; i < 1000; i++)
		Discord.split_message({ content: params[0], options: {}});

	return params[0] || 'Test';
};
