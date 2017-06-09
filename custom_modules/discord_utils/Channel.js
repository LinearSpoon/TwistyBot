// Return friendly name of channel
Discord.Channel.prototype.get_name = function() {
	if (this.type == 'voice' || this.type == 'text')
		return this.guild.name + '.' + this.name;
	if (this.type == 'dm')
		return 'DM.' + this.recipient.username + '#' + this.recipient.discriminator;
	if (this.type == 'group')
		return 'Group DM.' + this.id;

	return 'Invalid:' + this.id;
};
