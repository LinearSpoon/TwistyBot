# TwistyBot API v1.5.2

## Table of Contents

- [TwistyBot](#twistybot)
- [class: Client](#class-client)
	* [client.add_command(options)](#client-add-command)
- [class: Command](#class-command)
- [class: Config](#class-config)
- [class: Table](#class-table)
- [Discord.js extensions](#discord-js-extensions)
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

### extension: Channel
### extension: Guild
### extension: GuildMember
### extension: Message
### extension: User
### extension: Markdown Functions
#### <a name="markdown-italics"></a>Discord.italics(text)
- `text` <[String]> Text to format
- returns: <[String]> Text formatted with italics markdown
#### <a name="markdown-bold"></a>Discord.bold(text)
#### <a name="markdown-bold-italics"></a>Discord.bold_italics(text)
#### <a name="markdown-strikeout"></a>Discord.strikeout(text)
#### <a name="markdown-underline"></a>Discord.underline(text)
#### <a name="markdown-underline-italics"></a>Discord.underline_italics(text)
#### <a name="markdown-underline-bold"></a>Discord.underline_bold(text)
#### <a name="markdown-underline-bold-italics"></a>Discord.underline_bold_italics(text)
#### <a name="markdown-code-block"></a>Discord.code_block(text)
#### <a name="markdown-inline-code"></a>Discord.inline_code(text)
#### <a name="markdown-link"></a>Discord.link(link)
#### <a name="markdown-masked-link"></a>Discord.masked_link(text, link)
#### <a name="markdown-json"></a>Discord.json(value)

<!-- Link defines -->
[Function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[Number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[String]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[Boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"