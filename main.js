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

client.on('ready', () => console.log('Event: ready'));
client.on('disconnect', () => console.warn('Event: disconnected'));
client.on('guildMemberAdd', member => console.log('[New member]', member.guild.name + ':', member.user.username));
client.on('guildUnavailable', guild => console.log('[Guild unavailable]', guild.name));
client.on('messageDelete', message => log_message('Del', message));
client.on('messageDeleteBulk', message_coll => message_coll.array().forEach(message => log_message('Del', message)));
client.on('messageUpdate', (old_message,new_message) => log_message('Mod', new_message));
client.on('reconnecting', () => console.log('Event: reconnecting'));
client.on('warn', msg => console.warn('Event: warning', msg));
client.on('error', err => console.error('Event: error', err));

function log_message(explanation, message)
{
	console.log('[' + explanation + ']',
		'[' + message.channel.get_name() + ']',
		message.author.username + ':',
		message.cleanContent);
}

// Parse command and execute
client.on('message', function(message) {
	if (message.author.id == client.user.id)
		return; // Ignore own messages

	log_message('New', message);

	if (message.content[0] != '!')
		return; // Not a command

	if (message.channel.type == 'voice')
	{
		return; // Is it even possible?
	}

	var fn = message.cleanContent.split(' ')[0].slice(1).toLowerCase();	// Extract command name without !
	var params = message.cleanContent.slice(fn.length+1).trim();	// Extract params without command
	params = params == '' ? [] : params.split(',').map(e => e.trim());	// Split comma separated parameters

	if (!commands[fn] || typeof commands[fn].command !== 'function')
	 	return; // Not a valid command

	if (!message.check_permissions(config.get('global_permissions').concat(commands[fn].permissions)))
	{
		return; // Permission denied
	}

	if (params.length < commands[fn].params.min || params.length > commands[fn].params.max)
	{ // Invalid number of parameters, show parameter help text
		return message.channel.sendMessage(Discord.code_block(commands[fn].params.help));
	}

	message.channel.startTyping();
	var p = commands[fn].command.call(commands, client, message, params);

	p.then( function(text) {
		// Command finished with no errors
		if (!text)
		{
			console.log('Command did not respond');
			return; // Nothing to send
		}
		console.log('Command response:', text);

		return message.channel.sendmsg(text);
	})
	.catch( function(err) {
		// Something terrible happened
		console.warn(err.stack);
		message.channel.sendMessage(Discord.code_block('An error occurred while running the command:\n' + err.message));

		client.get_text_channel('Twisty-Test.logs').sendMessage(Discord.code_block(
			'Channel: ' + message.channel.get_name()
		 	+ '\nAuthor:  ' + message.author.username + '#' + message.author.discriminator
		 	+ '\nMessage: ' + message.cleanContent
			+ '\n' + err.stack));
	})
	.then( function() {
		// Always stop typing!
		message.channel.stopTyping();
	});
});

// These functions must return a promise
function start_servers()
{
	client.login(config.get('token'));
	return Promise.resolve();
}

custom_require('singleinstance')(start_servers, () => Promise.resolve());
