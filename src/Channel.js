let Channel = require('discord.js').Channel;

// Returns a friendly name for the channel (for logging)
Object.defineProperty(Channel.prototype, 'friendly_name',
	{
		get: function() {
			switch(this.type)
			{
				case 'voice':
				case 'text':
					return this.guild.name + '.' + this.name;
				case 'dm':
					return 'DM.' + this.recipient.tag;
				case 'group':
					return 'Group_DM.' + this.id;
				default:
					return 'Channel.' + this.id;
			}
		}
	}
);
