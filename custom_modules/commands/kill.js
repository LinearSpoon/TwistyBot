module.exports.help = {
	name: 'kill',
	text: 'Terminates process.',
	category: 'Admin'
}
module.exports.permissions = [];
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !kill`
};


module.exports.command = async function(client, message, params) {
	message.channel.sendmsg('Bye!')
		.then( () => process.exit(0) )
		.catch( () => process.exit(0) );
};
