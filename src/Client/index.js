let Discord = require('discord.js');
let Command = require('../Command');
let fs = require('fs');
let util = require('util');
let fs_readdir = util.promisify(fs.readdir);
let fs_stat = util.promisify(fs.stat);

/*
	Client
		.parsers
			.raw
			.markdown
			.comma_separated
		.guild_config
		.user_config
		.config
		.prefix
		.permissions
		.commands[]
			{Command}
		.commands_by_name[name]
			{Command}
*/

class Client extends Discord.Client
{
	constructor(options)
	{
		super(options);

		// Command parsers
		this.parsers = require('../parsers');

		// Classes that manage saving and loading config for the bot/guilds/users
		this.guild_config = options.guild_config || require('../Config');
		this.user_config = options.user_config || require('../Config');
		// Create an instance of the bot config class
		let bot_config = options.bot_config || require('../Config');
		this.config = new bot_config();

		// Other config
		this.prefix = options.prefix || '!';
		this.permissions = options.global_permissions || [];
		this.error_channel = options.error_channel;

		// Array of all registered command objects
		this.commands = [];
		// Map of command name/alias to command object
		this.commands_by_name = {};

		// Load event handlers
		fs.readdirSync(__dirname + '/events').forEach(function(file) {
			// Filename is the event name, but we need to remove the extension
			let event_name = file.replace(/\.[^\.]*/,'');
			this.on(event_name, require(__dirname + '/events/' + file));
		}.bind(this));
	}

	// Find a command by its name or alias
	// Returns undefined if not found
	get_command(command_name)
	{
		command_name = command_name.toLowerCase();
		return this.commands_by_name[command_name];
	}

	// Adds the default commands found in src/commands folder
	async add_default_commands()
	{
		await this.add_command_directory(__dirname + '/../commands');
	}

	// Registers a new command
	async add_command(options)
	{
		// Create the command
		let command = new Command(this, options);

		// Warn if the name is already used
		let existing = this.get_command(command.name);
		if (existing)
		{
			console.warn(command.name + ' will overwrite ' + existing.name + ' or one of its aliases!');
		}

		// Save the command by name
		this.commands_by_name[command.name.toLowerCase()] = command;

		command.aliases.forEach(function(alias) {
			// Warn if the alias is already used
			let existing = this.get_command(alias);
			if (existing)
			{
				console.warn(command.name + '\'s alias ' + alias + ' will overwrite ' + existing.name + ' or one of its aliases!');
			}

			// Save the command by alias
			this.commands_by_name[alias.toLowerCase()] = command;
		}, this);

		// Save the command
		this.commands.push(command);

		// Do any startup/caching work asynchronously
		await command.init();
	}

	// Loads a folder of command files with the following structure:
	// directory
	//  ├category1
	//  │ ├command1.js
	//  │ ├command2.js
	//  │ └command3.js
	//  └category2
	//    └command4.js
	//
	// Subfolders are treated as command categories, with the name of the subfolder used as the category name
	// Files within the subfolder should export command options that can be passed to client.add_command()
	// The filename will automatically be used as the command name, minus the file extension
	async add_command_directory(folder)
	{
		let self = this;
		let promises = [];

		// Load top level files and folders
		let files = await fs_readdir(folder);
		for(let i = 0; i < files.length; i++)
		{
			let path = folder + '/' + files[i];
			let stats = await fs_stat(path);

			if (stats.isDirectory())
			{
				// Subfolders use the folder name as the category
				let category = files[i];
				let subfiles = await fs_readdir(path);

				subfiles.forEach(function(subfile) {
					// Strip the file extension
					subfile = subfile.replace(/\.[^\.]*/,'');
					// Load command options
					let options = require(path + '/' + subfile);
					// Apply command name and category if they weren't already defined
					if (!options.name)
						options.name = subfile;
					if (!options.category)
						options.category = category;
					promises.push( self.add_command(options) );
				});
			}
			else if (stats.isFile())
			{
				// Top level files assume General category
				let options = require(path);
				// Apply command name and category if they weren't already defined
				if (!options.name)
					options.name = files[i].replace(/\.[^\.]*/,'');
				if (!options.category)
					options.category = 'General';
				promises.push( self.add_command(options) );
			}
		}

		// Wait for all commands to init
		await Promise.all(promises);
	}

	// Sends a message to the bot's error channel
	async log_error(err, message)
	{
		let emsg;

		// If a message object is passed, add some useful details
		if (message)
		{
			emsg = 'Channel: ' + message.channel.friendly_name +
				'\nAuthor:  ' + message.author.tag +
				'\nMessage: ' + message.cleanContent + '\n';
			// Add a stacktrace
			emsg += err.stack;
		}
		else
		{
			emsg = err.stack;
		}
		
		// // Append request path if it's a Discord API error, since the stacks for those are boring
		// if (err instanceof Discord.DiscordAPIError)
		// 	emsg += '\nSpecifically [' + err.code + '] ' + err.path;

		// Add other keys of the error object
		let keys = Object.keys(err);
		if (keys.length > 0)
		{
			emsg += '\n\nExtra:';
			for(let key of keys)
			{
				// Skip keys printed by the stack trace
				if (key == 'message' || key == 'stack')
					continue;
				
				emsg += '\n    ' + key + ' = ' + err[key].toString();
			}
		}

		console.warn(emsg);

		if (this.error_channel)
		{
			let channel = this.channels.get(this.error_channel);
			if (!channel)
				return;

			// Send the message
			try
			{
				await channel.send(Discord.code_block(emsg));
			}
			catch(err2)
			{
				console.warn('Failed to deliver error to log channel: ' + err2.stack);
			}
		}
	}
}

Client.prototype.send_response = require('./lib/send_response');

module.exports = Client;
