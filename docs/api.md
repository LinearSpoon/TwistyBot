<!-- http://tmpvar.com/markdown.html -->
# TwistyBot API v1.5.2

## Table of Contents

## TwistyBot

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

### class: Client
* extends: [Discord.Client](https://discord.js.org/#/docs/main/stable/class/Client)

#### <a name="client-add-command"></a>Client.add_command(options)
- `options` <[Object]>
	- `help` <?[Object]>
		- `description` <[String]> A short, one line description of the command.
		- `parameters` <[String]> Parameter usage information.
		- `details` <?[String]> A longer description of the command.
		- `examples` <?[Array]<[String]|[Object]>> An array of example commands and explanations.
			- `params` <[String]> The example's parameters.
			- `result` <[String]> The example's result.
	- `params` <?[Object]>
		- `min` <?[Number]> The minimum number of parameters.
		- `max` <?[Number]> The maximum number of parameters.
		- `parser` <?[String]|?[Function]> A parser used to convert the raw parameter string to parsed parameters.
		- `check` <?[Function]> A function used to check if the parameters are valid.
	- `permissions` <[Array]<[Object]>>
	- `aliases` <?[Array]<[String]>> A list of aliases for this command.
	- `name` <[String]> The name of this command.
	- `category` <[String]> The category of this command.
	- `run` <[Function]> The main command function that prepares the command response.

- returns: <[Promise]> Resolves when TwistyBot finishes initializing the command.

#### <a name="client-add-default-commands"></a>Client.add_default_commands()
- returns: <[Promise]> Resolves when TwistyBot finishes initializing the commands.

Adds the default commands. The default commands include `help`, `permission`, and `setprefix`.

#### <a name="client-get-command"></a>Client.get_command(command_name)
- returns: <?[Command]>

Finds a command by its name or alias. If no such command exists, this function returns undefined.

### class: Command
### class: Config
### class: Table

## Discord.js extensions
TwistyBot adds some extra functionality to the base Discord.js features. That is to say, you can access all the functions and variables of the original Discord.js classes, plus these additional functions defined by TwistyBot.

### extension: Channel
* extends: [Discord.Channel](https://discord.js.org/#/docs/main/stable/class/Channel)

#### <a name="channel-friendly-name"></a>Channel.friendly_name
- returns: <[String]> A friendly name for the channel. For example, a DM channel with user#1234 would be returned as `DM.user#1234`.

### extension: Guild
* extends: [Discord.Guild](https://discord.js.org/#/docs/main/stable/class/Guild)

#### <a name="guild-config"></a>Guild.config
- returns: <[Config]> Settings for this guild.

### extension: GuildMember
* extends: [Discord.GuildMember](https://discord.js.org/#/docs/main/stable/class/GuildMember)

#### <a name="guildmember-config"></a>GuildMember.config
- returns: <[Config]> Settings for this user.

### extension: Message
* extends: [Discord.Message](https://discord.js.org/#/docs/main/stable/class/Message)

#### <a name="message-string-content"></a>Message.string_content
- returns: <[String]> A string representation of the message content. Embeds and file attachments are also stringified after the main message text content.

### extension: User
* extends: [Discord.User](https://discord.js.org/#/docs/main/stable/class/User)

#### <a name="user-config"></a>User.config
- returns: <[Config]> Settings for this user.

### extension: Markdown Functions
The following are convenience functions for using Discord Markdown. They are made available as properties of the Discord.js module.

```javascript
const TwistyBot = require('twistybot');
const Discord = require('discord.js');
console.log( Discord.bold('Hello world!') );
```

#### <a name="markdown-italics"></a>Discord.italics(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted with italics markdown: `*text*`
#### <a name="markdown-bold"></a>Discord.bold(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted with bold markdown: `**text**`
#### <a name="markdown-bold-italics"></a>Discord.bold_italics(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted with bold and italics markdown: `***text***`
#### <a name="markdown-strikeout"></a>Discord.strikeout(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted with strikeout markdown: `~~text~~`
#### <a name="markdown-underline"></a>Discord.underline(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted with underline markdown: `__text__`
#### <a name="markdown-underline-italics"></a>Discord.underline_italics(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted with underline and italics markdown: `__*text*__`
#### <a name="markdown-underline-bold"></a>Discord.underline_bold(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted with underline and bold markdown: `__**text**__`
#### <a name="markdown-underline-bold-italics"></a>Discord.underline_bold_italics(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted with underline, bold, and italics markdown: `__***text***__`
#### <a name="markdown-code-block"></a>Discord.code_block(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted as a code block.
#### <a name="markdown-inline-code"></a>Discord.inline_code(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted as an inline code block.
#### <a name="markdown-link"></a>Discord.link(link)
- `link` <[String]> Link to format
- returns: <[String]>

This function formats a link so that it does not automatically embed a preview of the url after the message.

#### <a name="markdown-masked-link"></a>Discord.masked_link(text, link)
- `text` <[String]> Text to be displayed
- `link` <[String]> Link to format
- returns: <[String]>

Masked links display the given text instead of the url, allowing for nicer output. Masked links can only be used inside embeds, not regular text messages. Note that masked links are referred to as "spoopy links" within Discord.

#### <a name="markdown-json"></a>Discord.json(value)
- `value` <Any> Value to be formatted
- returns: <[String]>

A shortcut for making a JSON language code block using the stringified value.


<!-- Link defines -->
[Config]: #class-config
[Command]: #class-command

[Function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[Number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[String]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[Boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"