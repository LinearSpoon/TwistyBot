// This must be set before requiring chalk for colors to work.
// See: https://github.com/chalk/chalk for a list of colors
process.env['FORCE_COLOR'] = 'true';

// node_modules
var chalk            = require('chalk');
var path             = require('path');
var fs               = require('fs');

var logfile = fs.createWriteStream('server.log');

var original_log = console.log;
var original_info = console.info;
var original_warn = console.warn;
var original_error = console.error;

// Override console functions to print caller file, and color output based on how serious the message is
console.log = function()
{
	var caller = _getCallerInfo();
	var message = args_to_string(arguments);

	original_log( chalk.blue(caller.file + ':'), message);
	logfile.write(caller.file + ':' + caller.line + ': ' + message + '\n');
}

console.info = function()
{
	var caller = _getCallerInfo();
	var message = args_to_string(arguments);

	original_log( chalk.blue(caller.file + ':'), chalk.gray(message));
	logfile.write(caller.file + ':' + caller.line + ': ' + message + '\n');
}

console.warn = function()
{
	var caller = _getCallerInfo();
	var message = args_to_string(arguments);

	original_log( chalk.blue(caller.file + ':'), chalk.yellow(message));
	logfile.write(caller.file + ':' + caller.line + ': ' + message + '\n');
}

console.error = function()
{
	var caller = _getCallerInfo();
	var message = args_to_string(arguments);

	original_log( chalk.blue(caller.file + ':'), chalk.red(message));
	logfile.write(caller.file + ':' + caller.line + ': ' + message + '\n');
}

console.success = function()
{
	var caller = _getCallerInfo();
	var message = args_to_string(arguments);

	original_log( chalk.blue(caller.file + ':'), chalk.green(message));
	logfile.write(caller.file + ':' + caller.line + ': ' + message + '\n');
}

console.old = original_log;

/*
var tst = {abc:123, x:[1,2,3], y:{z:'string'}, tty:{colors:true, es:[[4,5],'test']}};
tst.c = tst;
//tst.tty.es.push(tst.tty);
tst.y.x = {copy:tst.y};
 console.log(tst);
*/

function args_to_string(a)
{
	return Array.prototype.map.call(a, stringify).join(' ');
}

function stringify(v)
{
	switch(typeof v)
	{
		case 'undefined': return 'undefined';
		case 'string': return v;
		case 'object':
			if (v instanceof Promise)
				return 'Promise';
			if (v instanceof Error)
				return v.message;
			if (v instanceof Date)
				return v.toJSON();
			if (v instanceof Buffer)
				return 'Buffer';
			if (v == null)
				return 'null';
			var r = JSONshort(v,[],[v],2);
			if (strip_ansi(r).length > 30)
				r = JSONlong(v,[],[v],2);

			return chalk.reset(r);
		default: return v.toString();
	}
}

function ts(v, cache, parents, depth)
{
	//console.log(v, typeof v)
	switch(typeof v)
	{
		case 'undefined': return chalk.gray('undefined');
		case 'number': return chalk.cyan(v);
		case 'string': return chalk.yellow("'" + v.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + "'");
		case 'function': return chalk.gray('function');
		case 'boolean': return chalk.red(v ? 'true' : 'false');
		case 'object':

			if (v instanceof Promise)
				return chalk.red('Promise');
			if (v instanceof Error)
				return chalk.red('Error(', chalk.yellow("'" + v.message + "'"), ')');
			if (v instanceof Date)
				return chalk.red(v.toJSON());
			if (v instanceof Buffer)
				return chalk.red('Buffer');
			if (v == null)
				return chalk.red('null');

			if (v.constructor && v.constructor.name == "Collection")
				return chalk.red('Collection');

			var s = get_cached(v, cache);
			if (s != null)
				return s;

			if (parents.indexOf(v) != -1)
				return chalk.gray('circular');

			parents.push(v);

			var r = JSONshort(v, cache, parents, depth+2);
			if (strip_ansi(r).length > 30)
				r = JSONlong(v, cache, parents, depth+2);

			parents.pop();

			cache.push({obj:v, str:r});
			return r;
		default: return chalk.red(v.toString());
	}
}

// Returns a JSON string with no newlines or leading spaces
function JSONshort(obj, cache, parents, depth)
{
	var s;
	if (Array.isArray(obj))
	{
		if (obj.length == 0)
			return '[]';
		s = '[ ';
		for(var i = 0; i < obj.length; i++)
		{
			if (Object.hasOwnProperty.call(obj, i))
				s += ts(obj[i], cache, parents, depth) + ', ';
		}
		return s.replace(/,?\s*$/, " ]");
	}
	else
	{
		s = '{ ';
		for(var i in obj)
		{
			if (Object.hasOwnProperty.call(obj, i))
				s += chalk.magenta(i) + ': ' + ts(obj[i], cache, parents, depth) + ', ';
		}
		return s.replace(/,?\s*$/, " }");
	}
}

// Returns a pretty formatted JSON string with each element on a new line and padding
function JSONlong(obj, cache, parents, depth)
{
	var padInner = '\n' + Array(depth+1).join(' ');
	var padOuter = padInner.slice(0,-2);
	var s;
	if (Array.isArray(obj))
	{
		if (obj.length == 0)
			return '[]';
		s = '[';
		for(var i = 0; i < obj.length; i++)
		{
			if (Object.hasOwnProperty.call(obj, i))
				s += padInner + ts(obj[i], cache, parents, depth) + ',';
		}
		return s.replace(/,?\s*$/, padOuter + "]");
	}
	else
	{
		s =  '{';
		for(var i in obj)
		{
			if (Object.hasOwnProperty.call(obj, i))
				s += padInner + chalk.magenta(i) + ': ' + ts(obj[i], cache, parents, depth) + ',';
		}
		return s.replace(/,?\s*$/, padOuter + "}");
	}
}

// Cache string representation of objects
function get_cached(obj, cache)
{
	var t = cache.find(function(v) {
		if (v.obj == obj)
			return true;
	});

	return t ? t.str : null;
}

// Remove ANSI escape sequences
function strip_ansi(str)
{
	return str.replace( /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

function _getCallerInfo() {
	var op = Error.prepareStackTrace;
	try {
		var err = new Error();
		var callerfile;
		var currentfile;
		Error.prepareStackTrace = function (err, stack) { return stack; };
		currentfile = err.stack.shift().getFileName();
		Error.prepareStackTrace = op;
		while (err.stack.length) {
			var sp = err.stack.shift();

			callerLine = sp.getLineNumber();
			callerfile = sp.getFileName();

			if(currentfile !== callerfile)
				return { file: path.basename(callerfile), line: callerLine };
		}
	} catch (err) {
		Error.prepareStackTrace = op;
	}
	return undefined;
}
