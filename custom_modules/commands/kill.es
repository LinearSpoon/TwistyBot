module.exports.help = {
	name: 'kill',
	text: 'Terminates process.',
	category: 'Admin'
}
module.exports.whitelist = config.get('admin_channels');
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !kill`
};


module.exports.command = async function(client, message, params) {
	process.exit(0);
};
