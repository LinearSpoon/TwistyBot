let Discord = require('discord.js');

// Discord markdown functions
// https://support.discordapp.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-
Discord.italics                = function(text) { return '*' + text + '*'; };
Discord.bold                   = function(text) { return '**' + text + '**'; };
Discord.bold_italics           = function(text) { return '***' + text + '***'; };
Discord.strikeout              = function(text) { return '~~' + text + '~~'; };
Discord.underline              = function(text) { return '__' + text + '__'; };
Discord.underline_italics      = function(text) { return '__*' + text + '*__'; };
Discord.underline_bold         = function(text) { return '__**' + text + '**__'; };
Discord.underline_bold_italics = function(text) { return '__***' + text + '***__'; };
Discord.code_block             = function(text) { return '```\n' + text + '```'; };
Discord.inline_code            = function(text) { return '`' + text + '`'; };
Discord.json                   = function(value) { return '```json\n' + JSON.stringify(value, null, 2) + '```'; };
Discord.link                   = function(link) { return '<' + link + '>'; };
Discord.masked_link            = function(text, link) { return '[' + text + '](' + link + ')'; };

// Export command parsers
module.exports.parsers = require('./parsers');

// Load hooks of Discord.js classes
require('./Channel');
require('./Guild');
require('./Message');

// Export custom client class
module.exports.Client = require('./Client');

return;

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
