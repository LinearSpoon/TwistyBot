let Discord = require('discord.js');

class Client extends Discord.Client
{
	constructor(options)
	{
		super(options);

		// Classes that manage saving and loading settings for guild/users
		this.guild_settings = options.guild_settings;
		this.user_settings = options.user_settings;

		// Other settings
		this.default_prefix = options.default_prefix || '!';

		// key = command name, value = command object
		this.commands_by_name = {};
		// key = category name, value = array of command objects
		this.commands_by_category = {};

		// Load event handlers
		let fs = require('fs');
		fs.readdirSync(__dirname + '/events').forEach(function(file) {
			// Filename is the event name, but we need to remove the extension
			let event_name = file.replace(/\.[^\.]*/,'');
			this.on(event_name, require(__dirname + '/events/' + file));
		}.bind(this));
	}

	add_command(require_path)
	{

	}

	add_command_directory(directory)
	{

	}


}

module.exports = Client;
