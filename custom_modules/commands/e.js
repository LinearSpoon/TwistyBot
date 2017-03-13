module.exports.help = {
	name: 'e',
	text: 'Evaluate Javascript code. Can be used as a simple calculator.',
	category: 'General'
};
module.exports.params = {
	min: 1,
	max: 999,
	help:
`Usage: !e <code>

Notes:
Runs Javascript code and returns the result of the last expression. Variables are saved per user and persist between commands, but are not saved across bot reboots.
Code does not have to be defined on one line, use shift+enter to break lines in Discord without sending the message.

Examples:
!e 1 + 1
!e 3 - Math.min(3 / 2, 1.7, 0.1 * 12 + -1)
!e var a = 1, b = 0, c = -4;
!e (-b + Math.sqrt(b*b - 4 * a * c)) / ( 2 * a)
!e "abcdefg".length
!e Array(104,101,108,108,111,33).map(e => String.fromCharCode(e)).join('')
!e function circle_area(radius) { return Math.PI * radius * radius; }
!e circle_area(12)
!e new Date().toDateString()`
};

module.exports.permissions = [
	{ user: '*' }
];

var sandboxes = {};

const vm = require('vm');
module.exports.command = async function(client, message, params) {
	// Repair the code
	var js_code = params.join(',');

	// Make a context for this author if they don't have one
	var sandbox = sandboxes[message.author.id] || {};

	try {
		var ret = JSON.stringify(vm.runInNewContext(js_code, sandbox, { timeout: 100 }));

		if (typeof ret === 'string' && ret.length > 1960)
			ret = ret.slice(0, 1980) + '...';

		// Reset their sandbox if it takes a lot of memory
		if (roughSizeOfObject(sandbox) > 1000000)
			sandboxes[message.author.id] = {};
		else
			sandboxes[message.author.id] = sandbox;

		return Discord.code_block(ret);
	} catch(e) {
		if (e instanceof SyntaxError)
		{ // Retrieve what the syntax error was
			var details = e.stack.split('\n').slice(1,3).join('\n');
			return Discord.code_block('Script SyntaxError: ' + e.message + '\n' +  details);
		}
		return Discord.code_block('Script Error: ' + e.message);
	}
};


// Source: http://stackoverflow.com/questions/1248302/javascript-object-size
function roughSizeOfObject( object ) {
    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}
