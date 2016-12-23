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

// Load utilities
global.util = custom_require('util');
global.apis = custom_require('apis');

global.database = custom_require('dbpool');

// Load commands
var commands = custom_require('commands');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => console.log('Event: ready'));
client.on('disconnect', () => console.warn('Event: disconnected'));
client.on('guildMemberAdd', member => console.log('Event: new member', member));
client.on('guildUnavailable', guild => console.log('Event: guild unavailable', guild));
client.on('messageDelete', message => log_message('Event: message deleted', message));
client.on('messageDeleteBulk', message_coll => message_coll.array().forEach(message => log_message('Event: messages deleted', message)));
client.on('messageUpdate', (old_message,new_message) => log_message('Event: message changed', new_message));
client.on('reconnecting', () => console.log('Event: reconnecting'));
client.on('warn', msg => console.warn('Event: warning', msg));
client.on('error', err => console.error('Event: warning', err));

function log_message(explanation, message)
{
	console.log(explanation + ':', message.content);
	console.log('  ' + message.author.username);
	console.log('  ' + message.channel.guild.name + '.' + message.channel.name);
	console.log('  ' + message.id);
}

// Parse command and execute
client.on('message', function(message) {
	var allowed_channels = config.get('channels');
	if (allowed_channels.length > 0 && allowed_channels.indexOf(message.channel.id) == -1)
		return;  // Only listen to allowed channels

	if (message.author.id == client.user.id)
		return;  // Ignore own messages

	log_message('Possible command', message);

	if (message.content[0] != '!')
		return;  // Not a command

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
		console.log(err);
		message.channel.sendMessage(util.dm.code_block(err.message));
	 	console.warn(err.stack);
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

// Detect and politely ask previous instances of node to shutdown
var ipc = require('node-ipc');
var server_id = 'TwistyBot';
ipc.config.silent = true;
ipc.config.id = server_id;
ipc.config.maxRetries = 0;

ipc.serve(function() {
	ipc.server.on('kill', function(data,socket) {
		console.log('Received kill message. Bye bye!');
		stop_server(socket);
	});
});

ipc.connectTo(server_id, function() {
	ipc.of[server_id].on('connect', function() {
		console.log('Found previous instance of', server_id, 'server.');
		// Send kill event and wait for going_away
		ipc.of[server_id].emit('kill');
	});

	ipc.of[server_id].on('error', function(err) {
		console.log('Could not find another instance of', server_id, 'server.');
		start_server();
	});

	ipc.of[server_id].on('going_away', function(data) {
		console.log('Previous server has shutdown. Starting server...');
		start_server();
	});
});


function start_server()
{
	ipc.server.start();
	client.login(config.get('token'));
}

function stop_server(notify_socket)
{
	if (notify_socket)
		ipc.server.emit(notify_socket, 'going_away');
	ipc.server.stop();
	console.log('Stopping process.');
	process.exit();
}
