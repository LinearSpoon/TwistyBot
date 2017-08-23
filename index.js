/***************************************************************
 *                       Globals
 ***************************************************************/
 // Log unhandled promises
process.on('unhandledRejection', function(err) {
	console.error('Promise Rejected!!!');
	console.warn(err.stack);
});

global.server_directory = __dirname;
global.root_require = name => require(global.server_directory + '/' + name);
global.src_require = name => require(global.server_directory + '/src/' + name);

// Load custom console output
src_require('console_hook');

// Load config
global.config = Object.assign(
	root_require('config/default_config'),
	root_require('config/config')
);

global.managers = src_require('managers');
global.Discord = src_require('discordjs');

/***************************************************************
 *                       Bot events
 ***************************************************************/
Discord.bot.on('ready', async function() {
	console.log('[Ready]');

	let sd = await managers.savedata.Discord.load_guild({ id: '232274245848137728' });
	sd.cmd_prefix = '!';
	await managers.savedata.Discord.save_guild(sd);
});

Discord.bot.on('disconnect', function(event) {
	console.warn('[Disconnect]', event.code, event.reason);
});

function pretty_message(message)
{
	let string = '[' + message.channel.get_friendly_name() + '] ' + message.author.username + ': ';
	if (message.cleanContent == '' && message.embeds.length > 0)
	{
		string += message.embeds.map(function(embed) {
			return embed.author
				? '[Embed ' + (embed.author.url || embed.author.name) + '] '
				: '[Embed ' + (embed.url || embed.title || embed.description) + '] ';
		}).join('\n');
	}

	return string + message.cleanContent;
}

Discord.bot.on('message', function(message) {
	console.log('[New]', pretty_message(message));
});

Discord.bot.login(config.get('token'));
