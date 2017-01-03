var fs = require('fs');
var compiler = custom_require('babel/compile');

const compiler_settings = { presets: ['es2017'] };

// See: https://nodejs.org/api/globals.html#globals_require_extensions
require.extensions['.es'] = function(_module, _filename) {
	//console.old('Require es: ' , _module._compile);
	var compiled_path = compiler.compile_file(_filename, compiler_settings);
	var compiled_code = fs.readFileSync(compiled_path, 'utf8')
	return _module._compile(compiled_code, _filename);
};
