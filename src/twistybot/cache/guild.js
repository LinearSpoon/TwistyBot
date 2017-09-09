let guildcache = { };

// Retrieve guild data from cache
module.exports.get = function(id) {
	if (!guildcache[id])
	{
		// Set up defaults
		guildcache[id] = {
			cmd_prefix: '!'
		};
	}

	return guildcache[id];
};

// Save guild data to database
module.exports.save = function(id) {

};

// Load saved guilds from database
module.exports.init = async function() {

};

module.exports.cache = guildcache;
