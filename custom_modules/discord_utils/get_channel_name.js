module.exports = function()
{ // this = channel
	if (this.type == 'voice')
		return this.guild.name + '.' + this.name;
	if (this.type == 'dm')
		return 'DM.' + this.recipient.username + '#' + this.recipient.discriminator;
	if (this.type == 'group')
		return 'Group DM.' + this.id;
	// this.type == 'text'
	return this.guild.name + '.' + this.name;
};
