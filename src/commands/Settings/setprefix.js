module.exports.help = {
	description: 'Sets the command prefix for this server.',
	parameters: '<new_prefix>',
	examples: [
		'%',
		'$$'
	]
};

module.exports.params = {
	min: 1,
	max: 1
};

module.exports.permissions = [
	// Allow guild leaders
	{ leader: true, allow: true },
	// Block everyone else
	{ user: '*', block: true },
];

module.exports.run = async function(Discord, client, params, info) {
	await info.message.guild.config.set('prefix', params[0]);
	return Discord.code_block('Prefix set to: ' + params[0]);
};
