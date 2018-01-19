<!-- http://tmpvar.com/markdown.html -->
# TwistyBot API v1.5.2

## Table of Contents

- [TwistyBot](#twistybot)
- [class: Client](#class-client)
	* [client.add_command(options)](#client-add-command)
- [class: Command](#class-command)
- [class: Config](#class-config)
- [class: Table](#class-table)
- [Discord.js extensions](#discordjs-extensions)
- [extension: Channel](#extension-channel)
- [extension: Guild](#extension-guild)
- [extension: GuildMember](#extension-guild)
- [extension: Message](#extension-guild)
- [extension: User](#extension-guild)
- [extension: Markdown Functions](#extension-markdown-functions)
	* [Discord.italics(text)](#markdown-italics)
	* [Discord.bold(text)](#markdown-bold)
	* [Discord.bold_italics(text)](#markdown-bold-italics)
	* [Discord.strikeout(text)](#markdown-strikeout)
	* [Discord.underline(text)](#markdown-underline)
	* [Discord.underline_italics(text)](#markdown-underline-italics)
	* [Discord.underline_bold(text)](#markdown-underline-bold)
	* [Discord.underline_bold_italics(text)](#markdown-underline-bold-italics)
	* [Discord.code_block(text)](#markdown-code-block)
	* [Discord.inline_code(text)](#markdown-inline-code)
	* [Discord.link(link)](#markdown-link)
	* [Discord.masked_link(text, link)](#markdown-masked-link)
	* [Discord.json(value)](#markdown-json)


### TwistyBot



### class: Client

* extends: [`Discord.Client`](https://discord.js.org/#/docs/main/stable/class/Client)

#### <a name="client-add-command"></a>client.add_command(options)
- `options` <[Object]>
	- `help` <[Object]>
		- `description` <[String]> A short, one line description of the command.
		- `parameters` <[String]> Parameter usage information
		- `details` <?[String]> A longer description of the command
		- `examples` <?[Array]<[String]|[Object]>> An array of example commands and explanations
			- `params` <[String]> The example's parameters
			- `result` <[String]> The example's result
- returns: <[Promise]>

### class: Command
### class: Config
### class: Table

### Discord.js extensions
TwistyBot adds some extra functionality to the base Discord.js features. That is to say, you can access all the functions and variables of the original Discord.js classes, plus these additional functions defined by TwistyBot.

### extension: Channel
### extension: Guild
### extension: GuildMember
### extension: Message
### extension: User
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
This function formats a link so that it does not automatically embed a preview of the url after the message.

- `link` <[String]> Link to format
- returns: <[String]>
#### <a name="markdown-masked-link"></a>Discord.masked_link(text, link)
Masked links display the given text instead of the url, allowing for nicer output. Masked links can only be used inside embeds, not regular text messages. Note that masked links are referred to as "spoopy links" within Discord.

- `text` <[String]> Text to be displayed
- `link` <[String]> Link to format
- returns: <[String]>
#### <a name="markdown-json"></a>Discord.json(value)
A shortcut for making a JSON language code block using the stringified value.

- `value` <Any> Value to be formatted
- returns: <[String]>

<!-- Link defines -->
[Function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[Number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[String]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[Boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"