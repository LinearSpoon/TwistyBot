module.exports.help = {
	description: 'Evaluate code with access to TwistyBot data.',
	parameters: '<code>',
	details: ''
};

module.exports.params = {
	parser: twistybot.parsers.raw
};

module.exports.permissions = [
	{ user: '*', block: true }
];

const vm = require('vm');
module.exports.run = async function(params, options) {
	try
	{
		let answer = vm.runInThisContext(params, { timeout: 500 });
		if (Number.isNaN(answer))
			return Discord.code_block('NaN');
		if (typeof answer === 'string' && answer.length > 1980)
			answer = answer.slice(0, 1980) + '...';

		return Discord.json(answer);
	} catch(e) {
		if (e instanceof SyntaxError)
		{ // Retrieve what the syntax error was
			let details = e.stack.split('\n').slice(1,3).join('\n');
			return Discord.code_block('Script SyntaxError: ' + e.message + '\n' +  details);
		}
		return Discord.code_block('Script Error: ' + e.message);
	}
};
