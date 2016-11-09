// Add bot link
// https://discordapp.com/oauth2/authorize?&client_id=228019028755611648&scope=bot&permissions=0

// Require from custom_modules folder without needing relative links
global.server_directory = __dirname;
global.custom_require = name => require(global.server_directory + '/custom_modules/' + name);
global.root_require   = name => require(global.server_directory + '/' + name);

custom_require('console_hook');	// This must be the first require
custom_require('kill_nodes');		// Windows - kill existing node instances
custom_require('babel/compile_require');

// Load config
global.config = root_require('config/config.js');
// Check missing keys
global.config.get = function(key) {
	if (typeof config[key] === 'undefined')
		throw Error('Config missing "'+ key +'"!');
	return config[key];
};

// Load utilities
global.util = custom_require('util');
custom_require('monkey_patches');

var commands = custom_require('commands');




const Discord = require('discord.js');
const client = new Discord.Client();
client.login(config.get('token'));

client.on('ready', function() {
	console.log('I am ready!');
});

// Parse command and execute
client.on('message', function(message) {
	var allowed_channels = config.get('channels');
	if (allowed_channels.length > 0 && allowed_channels.indexOf(message.channel.id) == -1)
		return;  // Only listen to allowed channels

	if (message.author.id == client.user.id)
		return;  // Ignore own messages

	if (message.content[0] != '!')
		return;  // Not a command

	console.log('Possible command:', message.content);
	console.log('>Author: ', message.author.username, '(' + message.author.id + ')');
	console.log('>Guild:  ', message.channel.guild.name, '(' + message.channel.guild.id + ')');
	console.log('>Channel:', message.channel.name, '(' + message.channel.id + ')');

	var fn = message.content.split(' ')[0].slice(1).toLowerCase();	// Extract command name without !
	var params = message.content.slice(fn.length+1).trim();	// Extract params without command
	params = params == '' ? [] : params.split(',').map(e => e.trim());	// Split comma separated parameters

	if (typeof commands[fn] !== 'function')
	 	return;  // Not a valid command

	// Finally...
	commands[fn].call(commands, client, message, params);
});
