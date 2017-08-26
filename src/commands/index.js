let fs = require('fs');

// Dynamically loads all commands based on the folder structure
let commands = {
	categories: {}, // For help command
	names: {} // For interpretter
};

// Top level folders are categories
let folders = fs.readdirSync(__dirname);
for(let i = 0; i < folders.length; i++)
{
	let category = folders[i];
	if (category == 'index.js')
		continue; // Skip this file

	commands.categories[category] = [];

	let folder = __dirname + '/' + category;

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

module.exports = commands;
