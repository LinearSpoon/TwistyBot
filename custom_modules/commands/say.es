
module.exports = async function(client, message, params) {
	if (!util.message_in(message, 'admin_channels'))
		return;

	var target_channel = client.channels.find(function(channel) {
		if (channel.type != 'text')
			return false;
		var channel_name = channel.guild.name + '.' + channel.name;
		return channel_name.toLowerCase() == params[0].toLowerCase();
	});

	console.log(target_channel);
	target_channel.sendMessage(params[1]);
};
