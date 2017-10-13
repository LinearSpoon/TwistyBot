let Discord = require('discord.js');
let Command = require('../Command');

class Client extends Discord.Client
{
	constructor(options)
	{
		super(options);

		// Command parsers
		this.parsers = require('../parsers');

		// Classes that manage saving and loading config for guild/users
		this.guild_config = options.guild_config || require('../Config');
		this.user_config = options.user_config || require('../Config');

		// Other config
		this.default_prefix = options.default_prefix || '!';
		this.global_permissions = options.global_permissions || [];

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

		// Load built in commands
		this.add_command_directory(__dirname + '/../commands');
	}

	add_command(require_path, name, category)
	{
		let options = require(require_path);

		// If name/category aren't defined, use the parameters
		if (!options.name)
			options.name = name;
		if (!options.category)
			options.category = category;

		let command = new Command(this, options);

		// Save the command under its category and by name
		this.commands_by_category[command.category].push(command);
		this.commands_by_name[command.name] = command;
	}

	add_command_directory(directory)
	{
		let fs = require('fs');

		let folders = fs.readdirSync(directory);
		for(let i = 0; i < folders.length; i++)
		{
			// Top level should be category folders
			let category = folders[i];
			if (!this.commands_by_category[category])
				this.commands_by_category[category] = [];

			// Files in category folders should be require-able modules that export a command object
			let folder = directory + '/' + category;
			let files = fs.readdirSync(folder);
			for(let j = 0; j < files.length; j++)
			{
				let file_no_ext = files[j].replace(/\.[^\.]*/,'');
				// The file name is the command name, the folder is the category
				this.add_command(folder + '/' + file_no_ext, file_no_ext, category);
			}
		}
	}
}

Client.prototype.send_response = require('./lib/send_response');

module.exports = Client;
