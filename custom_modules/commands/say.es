module.exports.help = {
	name: 'say',
	text: 'Send a message to a channel.',
	category: 'Admin'
};
module.exports.params = {
	min: 2,
	max: 2,
	help:
`Usage: !say

Examples:
!say twisty-test.dev, hi
!say twisty fork, hi`
};
module.exports.permissions = [];

module.exports.command = async function(client, message, params) {
	var target_channel = client.get_dm_channel(params[0]);
	if (!target_channel)
	{
		target_channel = client.get_text_channel(params[0]);
		if (!target_channel)
			return 'Not a valid channel';
	}

	target_channel.sendmsg(params[1])
		.catch(err => message.channel.sendMessage(err.message));
};
