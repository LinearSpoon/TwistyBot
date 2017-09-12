let Message = require('discord.js').Message;

// Returns a string representation of the message
Object.defineProperty(Message.prototype, 'string_content',
	{
		get: function() {
			return this.cleanContent;
		}
	}
);
