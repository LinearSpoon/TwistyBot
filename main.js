// Add bot link
// https://discordapp.com/oauth2/authorize?&client_id=228019028755611648&scope=bot&permissions=0

// Require from custom_modules folder without needing relative links
global.server_directory = __dirname;
global.custom_require = name => require(global.server_directory + '/custom_modules/' + name);
global.root_require   = name => require(global.server_directory + '/' + name);

custom_require('console_hook');	// This must be the first require
custom_require('kill_nodes');		// Windows - kill existing node instances


// Load config
global.config = root_require('config.js');
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

	console.log(message);
	var fn = message.content.split(' ')[0].slice(1).toLowerCase();	// Extract command name without !
	var params = message.content.slice(fn.length+1).trim();	// Extract params without command
	params = params == '' ? [] : params.split(',').map(e => e.trim());	// Split comma separated parameters

	if (typeof commands[fn] !== 'function')
	 	return;  // Not a valid command

	var hide_from = config.get('hide_from_users');

	if (hide_from.length > 0)
	{ // We have to check if certain members are online...
		return message.channel.guild.fetchMembers().then( function(guild) {
			//console.log(guild.members.array().map(el => el.user));
			var member = guild.members.array().find(function(el) {
				return (el.user.status != 'offline' && hide_from.indexOf(el.user.id) != -1);
			});
			if (member)
			{
				console.log('We are hiding from ' + member.user.username);
				return;
			}

			commands[fn].call(commands, client, message, params);
		})
	}
	// Finally...
	commands[fn].call(commands, client, message, params);
});
