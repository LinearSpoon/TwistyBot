# Writing Commands

## Adding a command
Commands can be added to TwistyBot in two ways. The first method uses [Client.add_command()](/docs/api.md#client-add-command) to directly add a single command. The following code demonstrates using Client.add_command() to add a command that adds together a list of numbers.

```javascript
let bot = new TwistyBot.Client();
await bot.add_command({
	// The name and category are required if using bot.add_command
	name: 'sum',
	category: 'General',

	// Used to generate help text
	help: {
		description: 'Adds a list of numbers',
		parameters: '<number1>, <number2>, ...',
		examples: [
			'1, 2, 3',
			'3.14, 3.14'
		]
	},

	// Specify that we need at least 2 parameters to continue
	params: {
		min: 2
	},

	// The function that does the work of the command
	run: async function(Discord, client, params, options) {
		let sum = 0;
		params.forEach(p => sum += parseFloat(p));
		return 'The sum is: ' + sum;
	}
});

```

The result of running the command:
![](/docs/images/sum-demo.png)

The helptext generated from the help properties:
![](/docs/images/sum-help.png)

The second method of adding commands uses [Client.add_command_directory()](/docs/api.md#client-add-command-folder). This requires creating a structured folder of command files. Subfolders are used as the category, and files within the category subfolders should be node modules that export command options. This is more convenient, as you don't need to specify the command name or category with this method. The category is inferred from the subfolder name, while the command name is just the filename that exported the command. An example directory structure is shown below

```
commands
 ├ General
 │ ├ add.js
 │ ├ feedback.js
 │ ├ whatsnew.js
 │ └ time.js
 └ Settings
   ├ setavatar.js
   └ setusername.js
```

The following code would then add 6 commands. `!add`, `!feedback`, `!whatsnew`, and `!time` would be added under the General category, while `!setavatar` and `!setusername` would be added to the Settings category.
```javascript
let bot = new TwistyBot.Client();
await bot.add_command_folder('./commands');
```

With this method, add.js would look like
```javascript
// Used to generate help text
module.exports.help = {
	description: 'Adds a list of numbers',
	parameters: '<number1>, <number2>, ...',
	examples: [
		'1, 2, 3',
		'3.14, 3.14'
	]
};

// Specify that we need at least 2 parameters to continue
module.exports.params = {
	min: 2
};

// The function that does the work of the command
module.exports.run = async function(Discord, client, params, options) {
	let sum = 0;
	params.forEach(p => sum += parseFloat(p));
	return 'The sum is: ' + sum;
};
```

## Command options

### options.name
The name of the command. This is required if using [Client.add_command()](/docs/api.md#client-add-command), but not if using [Client.add_command_directory()](/docs/api.md#client-add-command-folder). If there is a conflict where two commands have the same name, it will be logged to the console and only the most recently added command will be accessible.

### options.category
The category of the command, which can be any string. This is required if using [Client.add_command()](/docs/api.md#client-add-command), but not if using [Client.add_command_directory()](/docs/api.md#client-add-command-folder). Commands in the same category will be grouped together in the !help command.

### options.help
The help option is used by the !help command to generate help text. It is optional, but your command won't appear in !help if it doesn't have the help properties defined.

- `description` <[String]> A short, one line description of the command. This is used in !help's command list.
- `parameters` <[String]> Parameter usage information. This is used for command specific help.
- `details` <?[String]> A longer description of the command. This is used for command specific help.
- `examples` <?[Array]<[String]|[Object]>> An array of example commands and explanations. The examples may be strings or an object of `{ params, result }` if you wish to give an explanation of what the example does. You may mix and match strings with `{ params, result }` objects if you wish.

The following example documents a command called !mix:
```javascript
{
	description: 'A one line description',
	parameters: '<a>, <b>'
	details: 'A longer, possibly multiline description. ' +
		'\nYou can use Discord markdown as well. ' + Discord.bold('Hello world!'),
	examples: [
		'hot dog, bread',
		{
			params: 'grapes, kiwi'
			result: 'A fruity smoothie'
		}
	]
}
```

When the user runs `!help mix`, these options produce:
![](/docs/images/mix-help.png)

When the user runs `!help`, these options produce:
![](/docs/images/mix-minihelp.png)

### options.params
The params option specifies how parameters are parsed and validated prior to calling the [options.run](#optionsrun) function. For example, if you specify `{ min: 2 }`, it means the command requires 2 or more parameters. If the user passes 0 or 1 parameter, the run function will not be called and instead the command's help text will be returned.

- `min` <?[Number]> The minimum number of parameters.
- `max` <?[Number]> The maximum number of parameters.
- `parser` <?[String]|?[Function]> A parser used to convert the raw parameter string to parsed parameters.
	If passing a string, it should be one of the built in parsers. The options are:
	- `comma_separated` Each parameter is separated by a comma. Parameters may be quoted if they include commas within themselves. This is the default parser used if you omit the parser option.
	- `raw` The entire parameter string is returned without any parsing.
	If you pass a function, it should accept a string and return the parsed parameters. For example, to parse parameters separated by `;` instead of `,`, you might write a function like:
	
	```javascript
	function(parameters)
	{
		return parameters.split(';').map(p => p.trim());
	}
	```
	With this, a command such as `!sum 1; 2; 3`, the run function would receive an array of three strings, `[ '1', '2', '3' ]`.

- `check` <?[Function]> A function used to check if the parameters are valid. This function should accept the parsed parameters and return true if the parameters are OK or false if the parameters are not OK. The run function is only called if the parameters are OK, if they are not OK, the command's help text is returned instead. For example, this function ensures that every parameter is a number.
	```javascript
	function(parameters)
	{
		return parameters.every(p => !isNaN(p));
	}
	```


### options.permissions
An array of permission rules. See [Command Permissions](/docs/permissions.md) for an in depth explanation of the permission system.

### options.aliases
An array of alternate names for the command. Note that [options.name](#optionsname) is the name that will appear in the !help command.

### options.init
An optional async function that loads any data necessary for running the command. This function should return a promise that resolves when the function finishes loading data. TwistyBot will not run the command until this function resolves.

### options.run
An async function that does the work of the command. It always accepts 4 parameters:
- `Discord` <[Discord]> The discord.js module from `require('discord.js')`.
- `client` <[TwistyBot.Client](/docs/api.md#class-client)> The client which received this command.
- `params` <Any> The parsed parameters. The exact value depends on the parser function.
- `options` <[Object]>
	- `message` <[Discord.Message]> The user message which triggered the command.
	- `channel` <[Discord.Channel]> The channel which TwistyBot will respond in. This may differ from the message channel if the bot doesn't have permission to send messages there.
	- `name` <[String]> The name the user invoked the command with. May be the command name or one of its aliases.
	- `prefix` <[String]> The command prefix used.
	- `text` <[Boolean]> True if the bot has permission to send a text response in the output channel.
	- `embeds` <[Boolean]> True if the bot has permission to send an embed response in the output channel.
	- `files` <[Boolean]> True if the bot has permission to send a file attachment in the output channel.
	- `reactions` <[Boolean]> True if the bot has permission to send reactions in the output channel.

The return value of this function is automatically sent back to the user. You may return a string, [Discord.RichEmbed], a [Discord.Attachment], a [Table](/docs/api.md#class-table), or a `{ content, options }` object which can be passed to [TextChannel.send()](https://discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=send). You can also return an array of any mix of these, and they will all be sent to the user as separate messages.

If your command returns a string response that is longer than the Discord's 2000 character message limit, TwistyBot will automatically handle splitting it into multiple messages. TwistyBot's message splitter is smart in that it will preserve Markdown formatting across split messages. So if you return a long code block that needs to be split in the middle, TwistyBot will add the code block opening and closing tags where necessary so the split messages continue to be formatted properly.

## Examples

A hello world command.
```javascript
async function run(Discord, client, params, options)
{
	return Discord.code_block('Hello world');
}
```

A command that returns the current time.
```javascript
async function run(Discord, client, params, options)
{
	return new Date().toString();
}
```

A command that returns an embed.
```javascript
async function run(Discord, client, params, options)
{
	if (!options.embeds)
	{
		return Discord.code_block('Oops, give the bot permission to use embeds to use this command!');
	}

	let embed = new Discord.RichEmbed();
	// Use the bot's role color if in a guild, or gray otherwise
	embed.setColor(options.message.guild ? options.message.guild.me.displayColor : 0xCCCCCC);
	embed.setTitle('My Embed Command');
	embed.setDescription('TwistyBot is great!');
	embed.setThumbnail(client.user.avatarURL);

	return embed;
}
```

The result of the above code:
![](/docs/images/embed-demo.png)

A command that sets the bot's motd (Now playing ... near the bot's name in the user list).
```javascript
module.exports.params = {
	// Use raw parser so we can easily include commas in the motd
	parser: 'raw'
};

module.exports.run = async function(Discord, client, params, options) {
	try
	{
		if (params == '')
		{
			await client.user.setPresence({ game: null });
		}
		else
		{
			await client.user.setPresence({ game: { name: params, type: 0 } });
		}
	}
	catch(e)
	{
		return Discord.code_block(e.message);
	}

	return Discord.code_block('Done!');
};
```

A command that sets the bot's avatar from an image url.
```javascript
module.exports.params = {
	parser: 'raw'
};

module.exports.run = async function(Discord, client, params, options) {
	try
	{
		await client.user.setAvatar(params);
	}
	catch(e)
	{
		return Discord.code_block(e.message);
	}

	return Discord.code_block('Done!');
};
```



<!-- Link defines -->
[Discord]: https://discord.js.org/#/docs/main/stable/general/welcome "Discord"
[Discord.Message]: https://discord.js.org/#/docs/main/stable/class/Message "Discord.Message"
[Discord.User]: https://discord.js.org/#/docs/main/stable/class/User "Discord.User"
[Discord.Client]: https://discord.js.org/#/docs/main/stable/class/Client "Discord.Client"
[Discord.Channel]: https://discord.js.org/#/docs/main/stable/class/Channel "Discord.Channel"
[Discord.RichEmbed]: https://discord.js.org/#/docs/main/stable/class/RichEmbed "Discord.RichEmbed"
[Discord.Attachment]: https://discord.js.org/#/docs/main/stable/class/Attachment "Discord.Attachment"

[Function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[Number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[String]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[Boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"
[Error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error "Error"
[undefined]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined "undefined"