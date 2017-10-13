let Message = require('discord.js').Message;

// Returns a string representation of the message
Object.defineProperty(Message.prototype, 'string_content',
	{
		get: function() {
			let content = this.cleanContent;
			if (this.embeds.length > 0)
			{
				// Stringify the important properties of the embed
				let embed = this.embeds[0];

				let options = {
					title: embed.title,
					url: embed.url,
					description: embed.description,
				};

				if (embed.author)
					options.author = embed.author.name;

				if (embed.fields.length > 0)
				{
					options.fields = embed.fields.map(field => ({ name: field.name, value: field.value }));
				}

				content += '\n[Embed] ' + JSON.stringify(options, null, 2);
			}

			if (this.attachments.size > 0)
			{
				let attachment = this.attachments[0];
				let options = {
					filename: attachment.filename,
					url: attachment.url,
				};
				content += '\n[Attachment] ' + JSON.stringify(options, null, 2);
			}

			return content;
		}
	}
);
