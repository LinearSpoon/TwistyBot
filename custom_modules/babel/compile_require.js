var Module           = require('module');
var fs               = require('fs');
var path             = require('path');
var compiler         = custom_require('babel/compile');


var originalRequire = Module.prototype.require;

// Hook require function to compile jsx
Module.prototype.require = function()
{
	var filepath = arguments[0];
	if (path.extname(filepath) == '')
	{
		try {
			// See if the path exists with .es extension
			var es_filepath = filepath + '.es';
			fs.accessSync(es_filepath, fs.F_OK);
			filepath = es_filepath;
		} catch(err) {
			// Do nothing
		}
	}

	// Check if this file needs compiled
	if (path.extname(filepath) == '.es')
	{
		arguments[0] = compiler.compile_file(filepath, { presets: ["es2017"] });
	}

	return originalRequire.apply(this, arguments);
};
