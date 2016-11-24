var fs = require('fs');

module.exports = function(filepath, data)
{
	return new Promise(function(resolve, reject) {
		fs.writeFile(filepath, JSON.stringify(data,null,2), err => err ? reject(err) : resolve() );
	});
};
