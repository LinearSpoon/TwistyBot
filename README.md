# TwistyBot

Documentation in progress!

## What is TwistyBot?

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
