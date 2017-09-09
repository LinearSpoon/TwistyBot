module.exports.help = {
	description: 'Terminates process.',
	parameters: '',
	details: ''
};

module.exports.params = {
};

module.exports.permissions = [
	{ user: '*', block: true }
];

module.exports.run = async function(params, options) {
	options.channel.send('Bye!')
		.then( () => Discord.bot.destroy() )
		.then( () => process.exit(0) )
		.catch( () => process.exit(0) );
};
