let Guild = require('discord.js').Guild;

// Create a settings object automatically when accessing guild.settings
Object.defineProperty(Guild.prototype, 'config',
	{
		get: function() {
			if (!this.tb_settings)
			{
				this.tb_settings = new this.client.guild_config(this.id);
			}

			return this.tb_settings;
		}
	}
);
