var path             = require('path');
var fs               = require('fs');
var babel            = require('babel-core');

var compiled_output_directory = global.server_directory + '/compiled/';

function write_file(filepath, text)
{
	create_directory_path(filepath);
	fs.writeFileSync(filepath, text, { encoding:'utf8' });
}

function create_directory_path(filepath) {
	var dirname = path.dirname(filepath);
	if (directory_exists(dirname))
		return;
	// Recursively create lower directories
	create_directory_path(dirname);
	fs.mkdirSync(dirname);
}

function directory_exists(filepath) {
	try	{
		return fs.statSync(filepath).isDirectory();
	}	catch (err)	{
		return false;
	}
}

function get_file_modified_time(filepath)
{
	try {
		return fs.statSync(filepath).mtime.getTime();
	} catch (err) {
		return 0;
	}
}

function get_compiled_filepath(jsx_filepath)
{
	var filepath = compiled_output_directory + path.relative(global.server_directory, jsx_filepath);
	var filename = path.basename(filepath, path.extname(filepath)) + '.js'; // Switch extension
	return path.join(path.dirname(filepath), filename); // Combine dir with changed filename
}

function file_needs_recompile(jsx_filepath, js_filepath)
{
	var jsx_mtime = get_file_modified_time(jsx_filepath);
	var js_mtime = get_file_modified_time(js_filepath);

	return js_mtime < jsx_mtime;
}


// { presets: ["es2017"] }
// { presets: ["react"] }
module.exports.compile_file = function(jsx_filepath, options)
{
	var js_filepath = get_compiled_filepath(jsx_filepath);
	var compiled;
	if (file_needs_recompile(jsx_filepath, js_filepath))
	{
		console.log('Recompiling', jsx_filepath);
		try {
			compiled = babel.transformFileSync(jsx_filepath, options).code;
		} catch(err) {
			console.warn(err.message);
			console.log(err.codeFrame);
			// Don't send bad code
			compiled = ''; //, js_filepath = get_compiled_filepath('compiler_error.jsx') ;
		}
		write_file(js_filepath, compiled);
	}
	return js_filepath;
}
