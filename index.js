/***************************************************************
 *                       Globals
 ***************************************************************/
 // Node only logs the error message, without a stack trace for unhandled promise rejections
 // So we catch rejections here to log the stack and prevent killing the bot
process.on('unhandledRejection', function(err) {
	console.warn('Promise Rejected!');
	console.warn(err.stack);
});

// Require relative to project top level folder
global.root_require = name => require(__dirname + '/' + name);
// Require relative to src folder
global.src_require = name => require(__dirname + '/src/' + name);

// Override console.* with custom output
src_require('console_hook');

// Load config
global.config = Object.assign(
	root_require('config/default_config'),
	// First parameter is config file name, default = config
	root_require('config/' + (process.argv[2] || 'config'))
);


/***************************************************************
 *                      Set up bot
 ***************************************************************/
// Twistybot also makes "Discord" global
let twistybot = src_require('twistybot');
let bot = new twistybot.Client(
	{
		default_prefix: '!',
		guild_settings: src_require('settings/guild')
	}
);

bot.add_command_directory(__dirname + '/src/commands');

bot.login(config.get('token'));
