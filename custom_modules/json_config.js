var fs = require('fs');

module.exports.load = function(filepath)
{
	var data;
	try {
		data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
	} catch(e) {
		console.warn('Error loading file!', e.message);
		data = {};
	}
	return data;
};

module.exports.save = function(filepath, data)
{
	fs.writeFile(filepath, JSON.stringify(data,null,2), function(err) {
		if (err)
			console.warn('Error saving file:', err.message);
	});
};
