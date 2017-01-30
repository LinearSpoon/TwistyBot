module.exports.help = {
	name: 'say',
	text: 'A test command.',
	category: 'Admin'
};
module.exports.params = {
	min: 2,
	max: 2,
	help: `Usage: !say`
};
module.exports.whitelist = config.get('admin_channels');

module.exports.command = async function(client, message, params) {
	var target_channel = client.get_dm_channel(params[0]);
	if (!target_channel)
		return 'Not a valid channel';

	console.log(target_channel);
	target_channel.sendMessage(params[1]);
};
