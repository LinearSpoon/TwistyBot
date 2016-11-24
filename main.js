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
global.util = custom_require('util/_loader.js');
global.apis = custom_require('apis/_loader.js');

// ???
custom_require('monkey_patches');

// Load commands
var commands = custom_require('commands/_loader.js');


const Discord = require('discord.js');
const client = new Discord.Client();
client.login(config.get('token'));
client.on('ready', () => console.log('Ready!'));

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

	message.channel.startTyping();
	var p = commands[fn].call(commands, params);

	if (typeof p.then !== 'function')
	{ // Oops check
		console.error('Add async to', fn);
		message.channel.sendMessage(p);
		return message.channel.stopTyping();
	}

	// Add report Date to output!
	p.then( function(text) {
		if (!text)
			return; // Nothing to send
		console.log('Command response:', text);
		if (typeof text == "string" && text.length > 2000)
		{ // We need to break this up into smaller pieces
			var pieces = split_send_message(text);
			for(var i = 0; i < pieces.length; i++)
				message.channel.sendMessage(pieces[i]);
		}
		else
		{
			// Easy
			message.channel.sendMessage(text);
		}
	})
	.catch( function(err) {
		// Something terrible happened
		message.channel.sendMessage(util.dm.code_block(err.message));
	 	console.warn(err.stack)
	})
	.then( function() {
		// Always stop typing!
		message.channel.stopTyping();
	});
});

function split_send_message(text)
{
	var markdown = [
		{ token: '```', used: false},
		{ token: '`', used: false},
		{ token: '~~', used: false},
		{ token: '***', used: false},
		{ token: '**', used: false},
		{ token: '*', used: false},
		{ token: '__', used: false},
	];
	var pieces = text.split(/(```|`|\n|__|~~|\*\*\*|\*\*|\*)/);
	var all_messages = [];
	var current_message = "";
	for(var i = 0; i < pieces.length; i++)
	{
		if (current_message.length + pieces[i].length > 15)
		{ // Adding this piece would be too long, split the message here
			// Repair the markdown tags...
			for(var j = 0; j < markdown.length; j++) // Go forwards
			{
				if (markdown[j].used)
					current_message += markdown[j].token;
			}
			// Save the current message
			all_messages.push(current_message);
			// Prepare a new message and restore tags
			current_message = '';
			for(var j = markdown.length - 1; j >= 0; j--) // Go backwards
			{
				if (markdown[j].used)
					current_message += markdown[j].token;
			}
		}
		var tag = markdown.find(el => el.token == pieces[i]);
		if (tag)
		{ // We've found a tag, toggle it
			tag.used = ~tag.used;
		}
		// Add the current piece
		current_message += pieces[i];
	}
	// Push the last message
	all_messages.push(current_message);
	// Add message count
	for(var i = 0; i < all_messages.length; i++)
		all_messages[i] += '\n\nMessage ' + i + ' of ' + all_messages.length + '.';
	return all_messages;
}
