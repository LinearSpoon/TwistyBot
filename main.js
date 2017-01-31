// Add bot link
// https://discordapp.com/oauth2/authorize?&client_id=228019028755611648&scope=bot&permissions=0

// Require from custom_modules folder without needing relative links
global.server_directory = __dirname;
global.custom_require = name => require(global.server_directory + '/custom_modules/' + name);
global.root_require   = name => require(global.server_directory + '/' + name);

custom_require('console_hook');	// This must be the first require
custom_require('babel/compile_require');

// Load config
global.config = root_require('config/config.js');
// Check missing keys
global.config.get = function(key) {
	if (typeof config[key] === 'undefined')
		throw Error('Config missing "'+ key +'"!');
	return config[key];
};

// Augments discord.js with helper functions
var Discord = custom_require('discord_utils');
var client = new Discord.Client();
Discord.bot = client;

// Load utilities
global.util = custom_require('util');
global.apis = custom_require('apis');
global.database = custom_require('dbpool');

// Load commands
var commands = custom_require('commands');

var first_run = true;
client.on('ready', function() {
	console.log('Event: ready');
	if (first_run)
	{
		// List joined channels
		var channels = client.channels.array();
		for(var i = 0; i < channels.length; i++)
		{
			var channel = channels[i];
			if (channel.type != 'text')
				continue;
			console.log(util.printf('%-35s %s', channel.guild.name + '.' + channel.name, channel.id));
		}

		first_run = false;
	}
});
client.on('disconnect', () => console.warn('Event: disconnected'));
client.on('guildMemberAdd', member => console.log('[New member]', member.guild.name + ':', member.user.username));
client.on('guildUnavailable', guild => console.log('[Guild unavailable]', guild.name));
client.on('messageDelete', message => log_message('Del', message));
client.on('messageDeleteBulk', message_coll => message_coll.array().forEach(message => log_message('Del', message)));
client.on('messageUpdate', (old_message,new_message) => log_message('Mod', new_message));
client.on('reconnecting', () => console.log('Event: reconnecting'));
client.on('warn', msg => console.warn('Event: warning', msg));
client.on('error', err => console.error('Event: warning', err));

function log_message(explanation, message)
{
	if (message.channel.type == 'text')
	{
		console.log('[' + explanation + ']',
			'[' + message.channel.guild.name + '.' + message.channel.name + ']',
			message.author.username + ':',
			message.cleanContent);
	}
	else if (message.channel.type == 'dm')
	{
		console.log('[' + explanation + ']',
			'[Private Message]',
			message.author.username + ':',
			message.cleanContent);
	}
	else if (message.channel.type == 'group')
	{
		console.log('[' + explanation + ']',
			'[Group Message]',
			message.author.username + ':',
			message.cleanContent);
	}
}

// Parse command and execute
client.on('message', function(message) {
	if (message.author.id == client.user.id)
		return; // Ignore own messages

	log_message('New', message);

	if (message.content[0] != '!')
		return; // Not a command

	if (message.channel.type == 'text')
	{
		if (config.get('whitelist_channels').length > 0 && !util.message_in(message, 'whitelist_channels'))
			return; // Only listen to allowed channels

		if (util.message_in(message, 'blacklist_channels'))
			return; // Do not listen in blocked channels
	}
	else if (message.channel.type == 'dm' || message.channel.type == 'group')
	{
		if (!config.get('allow_dm'))
			return; // Ignore private messages unless specified
	}
	else
	{
		return; // always ignore message.channel.type == 'voice'
	}

	var fn = message.content.split(' ')[0].slice(1).toLowerCase();	// Extract command name without !
	var params = message.content.slice(fn.length+1).trim();	// Extract params without command
	params = params == '' ? [] : params.split(',').map(e => e.trim());	// Split comma separated parameters

	if (typeof commands[fn].command !== 'function')
	 	return; // Not a valid command

	if (commands[fn].whitelist && commands[fn].whitelist.indexOf(message.channel.id) == -1)
	{ // This command is not available in this channel
		return;
	}

	if (params.length < commands[fn].params.min || params.length > commands[fn].params.max)
	{ // Invalid number of parameters, show parameter help text
		return message.channel.sendMessage(util.dm.code_block(commands[fn].params.help));
	}

	message.channel.startTyping();
	var p = commands[fn].command.call(commands, client, message, params);

	if (typeof p.then !== 'function')
	{ // Oops check
		console.error('Add async to', fn);
		message.channel.sendMessage(p);
		return message.channel.stopTyping();
	}

	p.then( function(text) {
		// Command finished with no errors
		if (!text)
		{
			console.log('Command did not respond');
			return; // Nothing to send
		}
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
		console.warn(err.stack);
		message.channel.sendMessage(util.dm.code_block('An error occurred while running the command:\n' + err.message));
		var error_channel_output = 'Channel: ';
		switch(message.channel.type)
		{
			case 'text':
				error_channel_output += message.channel.guild.name + '.' + message.channel.name;
				break;
			case 'dm':
				error_channel_output += 'Private Message';
				break;
			case 'group':
				error_channel_output += 'Group Message';
				break;
		}
		error_channel_output += '\nAuthor: ' + message.author.username + '#' + message.author.discriminator;
		error_channel_output += '\nMessage: ' + message.cleanContent;
		error_channel_output += '\n' + err.stack;

		client.get_text_channel('Twisty-Test.logs').sendMessage(util.dm.code_block(error_channel_output));
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
		if (current_message.length + pieces[i].length > 1900)
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
	//for(var i = 0; i < all_messages.length; i++)
	//	all_messages[i] += '\nMessage ' + (i+1) + ' of ' + all_messages.length + '.\n';
	return all_messages;
}

// These functions must return a promise
function start_servers()
{
	client.login(config.get('token'));
	return Promise.resolve();
}

custom_require('singleinstance')(start_servers, () => Promise.resolve());
