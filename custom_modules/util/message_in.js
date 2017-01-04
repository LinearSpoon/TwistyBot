module.exports = function(message, config_channel_list)
{
	return config.get(config_channel_list).indexOf(message.channel.id) > -1;
}
