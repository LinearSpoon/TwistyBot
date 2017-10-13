let User = require('discord.js').User;

// Create a config object automatically when accessing user.config
Object.defineProperty(User.prototype, 'config',
	{
		get: function() {
			if (!this.tb_config)
			{
				this.tb_config = new this.client.user_config(this.id);
			}

			return this.tb_config;
		}
	}
);
