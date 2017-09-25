let Discord = require('discord.js');

class Client extends Discord.Client
{
	constructor(options)
	{
		super(options);

		// Command parsers
		this.parsers = require('../parsers');

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

		// Load built in commands
		this.add_command_directory(__dirname + '/../commands');
	}

	add_command(require_path, name, category)
	{
		let cmd = require(require_path);

		// If name/category aren't defined, use the parameters
		if (!cmd.name)
			cmd.name = name;
		if (!cmd.category)
			cmd.category = category;

		// Save the command under its category and by name
		this.commands_by_category[cmd.category].push(cmd);
		this.commands_by_name[cmd.name] = cmd;
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

	help_text(command_name, options)
	{
		let command = this.commands_by_name[command_name];
		if (!command || !command.help)
			return; // Invalid command name or no help defined

		let help = `Usage: ${ options.prefix }${ command.name } ${ command.help.parameters }`;
		if (command.help.details && command.help.details.length > 0)
			help += '\n\n' + command.help.details;
		return help;
	}
}

Client.prototype.check_permission = require('./lib/check_permission');
Client.prototype.send_response = require('./lib/send_response');

module.exports = Client;
