// Optional: Help options
module.exports.help = {
	// Required: A short, one line description of the command used for !help
	description: 'My favorite command',

	// Required: Explanation of each parameter
	// Appears as 'Usage: !command <param1>, <param2>'
	parameters: '<param1>, <param2>',

	// Optional: A longer description of the command used for !help <command>
	details:
		'This command adds param1 and param2 together\n' +
		'Note: param1 and param2 must be numbers!',

	// Optional: A list of examples of valid command usage
	// Appears as
	//   Examples:
	//   !command 1, 2
	//   !command 3.14, 3.14
	examples: [
		'1, 2',
		'3.14, 3.14'
	]
};

// Optional: Parameter options
module.exports.params = {
	// Optional: Minimum number of parameters
	min: 2,

	// Optional: Maximum number of parameters
	max: 2,

	// Optional: The parser to use on the command parameters
	// If paraser is a string, it is one of twistybot's built in parsers
	// Parser may also be a user defined function
	// The function should accept one parameter (the unparsed parameter string)
	// The function should return the parsed parameters (passed to run function)
	parser: 'comma_separated',

	// Optional: A function that checks if the parsed parameters are acceptable
	check: function(params) {
		// Ensure both parameters are numbers
		let n0 = Number(params[0]);
		let n1 = Number(params[1]);
		return !(Number.isNaN(n0) || Number.isNaN(n1));
	}
};

// Optional: An array of permission rules for this command
module.exports.permissions = [
	{ user: '*', block: true }
];

// Optional: An array of aliases (alternate names) for this command
module.exports.aliases = [ 'my_favorite' ];

// Optional: The command name. If this is not set, the filename (minus extension) is used as the name.
module.exports.name = 'my_command';

// Optional: Category name. If this is not set, the folder name is used.
module.exports.category = 'Help';

// Required: A function that runs the command and returns the result
module.exports.run = async function(Discord, client, params, options) {
	return Number(params[0]) + Number(params[1]);
};
