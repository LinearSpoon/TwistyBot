<!-- http://tmpvar.com/markdown.html -->
# TwistyBot API v1.5.3

## Table of Contents

- [Table of Contents](#table-of-contents)
- [TwistyBot](#twistybot)
	- [class: Client](#class-client)
		- [Client.add_command(options)](#client-add-command)
		- [Client.add_command_directory(folder)](#client-add-command-folder)
		- [Client.add_default_commands()](#client-add-default-commands)
		- [Client.get_command(command_name)](#client-get-command)
		- [Client.log_error(err, message)](#client-log-error)
	- [class: Command](#class-command)
		- [Command.stats()](#command-stats)
		- [Command.reset_stats()](#command-reset-stats)
		- [Command.helptext(prefix)](#command-helptext)
	- [class: Config](#class-config)
		- [Config.get(key)](#config-get)
		- [Config.set(key, value)](#config-set)
		- [Config.clear()](#config-clear)
	- [class: Table](#class-table)
		- [Table.align(a)](#table-align)
		- [Table.min_width(...w)](#table-min-width)
		- [Table.push(...row)](#table-push)
		- [Table.header(...row)](#table-header)
		- [Table.full(value)](#table-full)
		- [Table.div()](#table-div)
		- [Table.pop()](#table-pop)
		- [Table.empty()](#table-empty)
		- [Table.toString()](#table-tostring)
		- [Table.length](#table-length)
		- [Table.width](#table-width)
- [Discord.js extensions](#discordjs-extensions)
	- [extension: Channel](#extension-channel)
		- [Channel.friendly_name](#channel-friendly-name)
	- [extension: Guild](#extension-guild)
		- [Guild.config](#guild-config)
	- [extension: GuildMember](#extension-guildmember)
		- [GuildMember.config](#guildmember-config)
	- [extension: Message](#extension-message)
		- [Message.string_content](#message-string-content)
	- [extension: User](#extension-user)
		- [User.config](#user-config)
	- [extension: Markdown Functions](#extension-markdown-functions)
		- [Discord.italics(text)](#markdown-italics)
		- [Discord.bold(text)](#markdown-bold)
		- [Discord.bold_italics(text)](#markdown-bold-italics)
		- [Discord.strikeout(text)](#markdown-strikeout)
		- [Discord.underline(text)](#markdown-underline)
		- [Discord.underline_italics(text)](#markdown-underline-italics)
		- [Discord.underline_bold(text)](#markdown-underline-bold)
		- [Discord.underline_bold_italics(text)](#markdown-underline-bold-italics)
		- [Discord.code_block(text)](#markdown-code-block)
		- [Discord.inline_code(text)](#markdown-inline-code)
		- [Discord.link(link)](#markdown-link)
		- [Discord.masked_link(text, link)](#markdown-masked-link)
		- [Discord.json(value)](#markdown-json)


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
	- `init` <[Function]> A function called to initialize any data the command uses.
	- `run` <[Function]> The main command function that prepares the command response.

- returns: <[Promise]> Resolves when TwistyBot finishes initializing the command.

#### <a name="client-add-command-folder"></a>Client.add_command_directory(folder)
- `folder` <[String]> Path to a folder of commands

- returns: <[Promise]> Resolves when TwistyBot finishes initializing all commands in the folder.

This function provides a convenient way to load an organized folder of commands, with the following structure:
```
folder
 ├category1
 │ ├command1.js
 │ ├command2.js
 │ └command3.js
 └category2
   └command4.js
```
Subfolders are treated as command categories, with the name of the subfolder used as the category name. Files within the subfolder should export command options that can be passed to [Client.add_command()](#client-add-command). The filename will automatically be used as the command name, excluding the file extension. An example command folder can be found at /src/commands, which contains TwistyBot's default commands.


#### <a name="client-add-default-commands"></a>Client.add_default_commands()
- returns: <[Promise]> Resolves when TwistyBot finishes initializing the commands.

Adds the default commands. The default commands include `help`, `permission`, and `setprefix`.

#### <a name="client-get-command"></a>Client.get_command(command_name)
- returns: <?[Command]>

Finds a command by its name or alias. If no such command exists, this function returns undefined.

#### <a name="client-log-error"></a>Client.log_error(err, message)
- `err` <[Error]> The error that was raised.
- `message` <[Discord.Message]> The command message that was being processed.

This function delivers a stack trace of the error to the bot's Discord error channel. You can specify this channel by passing a channel ID to the bot constructor:
```javascript
let bot = new TwistyBot.Client({
	error_channel: '212345627062207890'
});
```

- returns: <[Promise]>

### class: Command

#### <a name="command-stats"></a>Command.stats()
- returns: <[Object]>
	- `uses` <[Number]> The number of times the command was used.
	- `errors` <[Number]> The number of times the command failed to complete (threw an error)
	- `average_time_ms` <[Number]> Average running time of the command in milliseconds

#### <a name="command-reset-stats"></a>Command.reset_stats()
- returns: <[undefined]>

Clears the usage/error statistics for this command.

#### <a name="command-helptext"></a>Command.helptext(prefix)
- `prefix` <[String]> The command prefix to use in examples and usage.

- returns: <[String]> The formatted help text

### class: Config

#### <a name="config-get"></a>Config.get(key)
- `key` <[String]>

- returns <[Promise]<Any>> Resolves with the value of key.

#### <a name="config-set"></a>Config.set(key, value)
- `key` <[String]>
- `value` <Any>

- returns: <[Promise]> Resolves when the key is set to value

#### <a name="config-clear"></a>Config.clear()
- returns: <[Promise]> Resolves when all keys are cleared


### class: Table
- `theme` <?[String]> Specifies the theme of the table. There are two built-in themes: 'default' and 'borderless'.

#### <a name="table-align"></a>Table.align(a)
- `a` <[String]> Specifies the alignments of each column. Valid characters are 'l' for left, 'r' for right, and 'c' fo center aligned. For example, 'llr' indicates the first two columns are left aligned, and the third column is right aligned.

- returns: <[undefined]>

#### <a name="table-min-width"></a>Table.min_width(...w)
- `w` <[Number]> The minimum width in characters of each column.

- returns: <[undefined]>

#### <a name="table-push"></a>Table.push(...row)
- `row` <Any> A row of table values.

- returns: <[undefined]>

This function adds a new row of values to the bottom of the table.

#### <a name="table-header"></a>Table.header(...row)
- `row` <Any> A row of table values.

- returns: <[undefined]>

This function adds a new row of center aligned values to the bottom of the table. A separator is added automatically after the row is inserted.

#### <a name="table-full"></a>Table.full(value)
- `value` <Any> A single value.

- returns: <[undefined]>

This function adds a full width, centered row to the bottom of the table.

#### <a name="table-div"></a>Table.div()
- returns: <[undefined]>

This function adds a separator between the bottom row and the next row pushed.

#### <a name="table-pop"></a>Table.pop()
- returns: <[undefined]>

This function removes the most recently pushed row.

#### <a name="table-empty"></a>Table.empty()
- returns: <[undefined]>

This function removes all rows from the table.

#### <a name="table-tostring"></a>Table.toString()
- returns: <[String]>

Stringifies the table. Does not add Discord code block tags.

#### <a name="table-length"></a>Table.length
- returns: <[Number]> The number of rows in the table.

#### <a name="table-width"></a>Table.width
- returns: <[Number]> The number of columns in the table.

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
* extends: [Discord.Message]

#### <a name="message-string-content"></a>Message.string_content
- returns: <[String]> A string representation of the message content. Embeds and file attachments are also stringified after the main message text content.

### extension: User
* extends: [Discord.User]

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

[Discord.Message]: https://discord.js.org/#/docs/main/stable/class/Message "Discord.Message"
[Discord.User]: https://discord.js.org/#/docs/main/stable/class/User "Discord.User"

[Function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[Number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[String]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[Boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"
[Error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error "Error"
[undefined]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined "undefined"