var util = custom_require('util');

var save_path = global.server_directory + '/config/save_data.json';
var save_data;


module.exports.load = function()
{
	try {
		save_data = JSON.parse(util.load_file(save_path));
	} catch(e) {
		save_data = {};
	}
};

module.exports.save = function()
{
	console.log('save file');
	util.save_file(save_path, JSON.stringify(save_data));
};

module.exports.set = function(key, value)
{
	save_data[key] = value;
};

module.exports.get = function(key)
{
	return save_data[key];
};


module.exports.load()
