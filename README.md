# TwistyBot

Click [here](https://discord.com/api/oauth2/authorize?client_id=228019028755611648&scope=bot+applications.commands&permissions=36574383104) if you are just looking to invite TwistyBot to your server.

The rest of this page contains information for developers looking to create a new Discord bot using TwistyBot's command framework. If you need help using TwistyBot, use the `!help` command or DM Twisty Fork#0899 on Discord.

Documentation in progress!

## What is TwistyBot?
TwistyBot is a command framework that extends [Discord.js](https://discord.js.org/#/docs/main/stable/general/welcome). TwistyBot helps you build quickly build custom command for Discord chat bots. It includes a permission system, multiple command parsers, and helpful functions to simplify formatting your responses. 


## Installation
Requirements
- [Node.js](https://nodejs.org/) 7.10.0 or higher for async/await support.
- [Discord.js](https://discord.js.org/#/docs/main/stable/general/welcome) is also required as a peer dependency.

```
npm install --save discord.js
npm install --save twistybot
```

## Usage

```javascript
const TwistyBot = require('twistybot');
let bot = new TwistyBot.Client();

(async function() {
	// Register default commands
	await bot.add_default_commands();

	// Register a folder of commands
	await bot.add_command_directory(__dirname + '/commands');

	// Begin listening for commands
	bot.login('your bot token');
})();
```

## Documentation
- [How do I get a bot account/token?](/docs/bot_account.md)
- [Writing Commands](/docs/commands.md)
- [Command Permissions](/docs/permissions.md)
- [API](/docs/api.md)
- [Discord.js](https://discord.js.org/#/docs/main/stable/general/welcome)
