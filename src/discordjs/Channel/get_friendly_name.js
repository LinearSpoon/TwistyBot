// Return a nice name for this channel
module.exports = function() {
	switch(this.type)
	{
		case 'voice':
		case 'text':
			return this.guild.name + '.' + this.name;
		case 'dm':
			return 'DM.' + this.recipient.tag;
		case 'group':
			return 'Group DM.' + this.id;
		default:
			return 'Channel.' + this.id;
	}
};
