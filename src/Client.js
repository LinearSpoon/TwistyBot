let Discord = require('discord.js');
let Command = require('./Command');
let walk_directory = require('./lib/walk_directory.js');
let split_message = require('./lib/split_message.js');

/*
	Client
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
		options = options || {};
		super(options);

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
		walk_directory(__dirname + '/events', function(file) {
			this.on(file.name_no_ext, require(file.path));
		}.bind(this));
	}

	async send(responses, info)
	{
		// Convert response to an array
		if (!Array.isArray(responses))
		{
			responses = [responses];
		}

		// Remove empty responses (null, undefined, "")
		responses = responses.filter(response => response);
		// Convert responses to { content, options } for channel.send
		responses = responses.map(function(response) {
			if (typeof response === 'string')
				return { content: response, options: {} };
			
			if (response instanceof Discord.RichEmbed)
				return { content: '', options: { embed: response } };
			
			if (response instanceof Discord.Table)
				return { content: Discord.code_block(response.toString()), options: {} };
			
			if (response instanceof Discord.Attachment)
				return { content: '', options: response };
			
			if (typeof response === 'object')
				return response; // assume it is already a { content, options } object
			
			// Just hope it has a reasonable toString defined
			return { content: String(response), options: {} };
		});

		if (responses.length == 0)
			return; // Nothing to send

		// If the response is redirected to the user's DM, add an explanation to the first message
		if (info.redirected)
		{
			responses[0].content = `Hi, ${this.user.username} doesn't have permission to respond in ${info.message.channel.friendly_name}\n`
				+ info.message.cleanContent + '\n' + responses[0].content;
		}

		// Identify and split responses which are beyond the 2000 character limit
		let messages = [].concat(...responses.map(split_message));

		// Send the messages
		return Promise.all(messages.map(message => info.channel.send(message.content, message.options)));
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
		await this.add_command_directory(__dirname + '/commands');
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
		await command._init();
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
		walk_directory(folder, function(file) {
			if (file.is_directory)
			{
				// Subfolders use the folder name as the category
				let category = file.name;
				walk_directory(file.path, function(subfile) {
					// Load command options
					let options = require(subfile.path);
					// Apply command name and category if they weren't already defined
					if (!options.name)
						options.name = subfile.name_no_ext;
					if (!options.category)
						options.category = category;
					promises.push(self.add_command(options));
				});
			}
			
			if (file.is_file)
			{
				// Top level files assume General category
				let options = require(file.path);
				// Apply command name and category if they weren't already defined
				if (!options.name)
					options.name = file.name_no_ext;
				if (!options.category)
					options.category = 'General';
				promises.push(self.add_command(options));
			}
		});

		// Wait for all commands to init
		await Promise.all(promises);
	}

	// Sends a message to the bot's error channel
	async log_error(err, message)
	{
		let emsg = err.stack;

		// If a message object is passed, add some useful details
		if (message)
		{
			emsg = 'Channel: ' + message.channel.friendly_name +
				'\nAuthor:  ' + message.author.tag +
				'\nMessage: ' + message.cleanContent +
				'\n' + emsg;
		}

		// Add other keys of the error object
		let keys = Object.keys(err);
		if (keys.length > 0)
		{
			emsg += '\n\nExtra:';
			for (let key of keys)
			{
				// Skip keys printed by the stack trace
				if (key == 'message' || key == 'stack')
					continue;
				// Don't use toString() here, it is not always defined for some values eg: null
				emsg += '\n    ' + key + ' = ' + String(err[key]);
			}
		}

		// Log error in case it can't be sent
		console.warn(emsg);

		if (this.error_channel)
		{
			let channel = this.channels.get(this.error_channel);
			if (!channel)
				return;

			// Send the message
			try
			{
				while(emsg.length > 0)
				{
					// Slice the first 1990 characters and send those
					let m = emsg.slice(0, 1990);
					emsg = emsg.slice(1990);
					await channel.send(Discord.code_block(m));
				}
			}
			catch (err2)
			{
				console.warn('Failed to deliver error to log channel: ' + err2.stack);
			}
		}
	}
}

module.exports = Client;
