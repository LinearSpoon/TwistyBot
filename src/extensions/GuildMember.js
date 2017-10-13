let GuildMember = require('discord.js').GuildMember;

// Adds a shortcut for accessing user config from a guild member object
Object.defineProperty(GuildMember.prototype, 'config',
	{
		get: function() {
			return this.user.config;
		}
	}
);
