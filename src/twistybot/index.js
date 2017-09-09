global.twistybot = {};

// TwistyBot data caches
twistybot.cache = require('./cache');

// String parsing functions
twistybot.parsers = require('./parsers');

// TwistyBot helper functions
twistybot.check_permission = require('./lib/check_permission');
twistybot.send_response = require('./lib/send_response');
twistybot.split_message = require('./lib/split_message');
twistybot.helptext = require('./lib/helptext');

// Dynamically loads all commands based on the folder structure
/*
	commands
		names[cmd_name] = cmd
		categories[category_name][] = cmd

	cmd
		.help
			.description
			.parameters
			.details
		.params
			.min
			.max
			.parser
			.check
		.permissions[] = rule
		.run
*/
let fs = require('fs');
let commands = {
	categories: {}, // For help command
	names: {} // For interpretter
};

// Top level folders are categories
let folders = fs.readdirSync(__dirname + '/commands');
for(let i = 0; i < folders.length; i++)
{
	let category = folders[i];
	commands.categories[category] = [];

	let folder = __dirname + '/commands/' + category;

	// Files in category folders are commands
	fs.readdirSync(folder).forEach(function(file) {
		let file_no_ext = file.replace(/\.[^\.]*/,'');
		let cmd = require(folder + '/' + file_no_ext);

		// Save command name
		cmd.name = file_no_ext;

		// Export the command under its category and by name
		commands.categories[category].push(cmd);
		commands.names[file_no_ext] = cmd;
	});
}

twistybot.commands = commands;
