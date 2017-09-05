let Cache = src_require('classes/Cache');

module.exports.guilds = new Cache();
module.exports.users = new Cache();

setInterval(function() {
	for(let k in module.exports)
	{
		let keys_removed = module.exports[k].clean();
		if (keys_removed > 0)
			console.log('Removed ' + keys_removed + ' keys from ' + k);
	}
}, 120000);
