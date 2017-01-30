// Returns a channel based on the format "guild name.channel name"
module.exports = function(channel_name) {
	return this.channels.find(function(channel) {
		if (channel.type != 'text')
			return false;
		var name = channel.guild.name + '.' + channel.name;
		return channel_name.toLowerCase() == name.toLowerCase();
	});
};
