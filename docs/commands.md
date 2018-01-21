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

		- `description` <[String]> A short, one line description of the command.
		- `parameters` <[String]> Parameter usage information.
		- `details` <?[String]> A longer description of the command.
		- `examples` <?[Array]<[String]|[Object]>> An array of example commands and explanations.
			- `params` <[String]> The example's parameters.
			- `result` <[String]> The example's result.

### options.params
		- `min` <?[Number]> The minimum number of parameters.
		- `max` <?[Number]> The maximum number of parameters.
		- `parser` <?[String]|?[Function]> A parser used to convert the raw parameter string to parsed parameters.
		- `check` <?[Function]> A function used to check if the parameters are valid.

### options.permissions

### options.aliases

### options.init

### options.run