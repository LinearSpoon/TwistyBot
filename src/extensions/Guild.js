let Guild = require('discord.js').Guild;

// Returns a friendly name for the channel (for logging)
Object.defineProperty(Guild.prototype, 'settings',
	{
		get: function() {
			if (!this.tb_settings)
			{
				this.tb_settings = new this.client.guild_settings(this.id);
			}

			return this.tb_settings;
		}
	}
);
