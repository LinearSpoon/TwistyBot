let usercache = { };

// Retrieve user data from cache
module.exports.get = function(id) {
	if (!usercache[id])
	{
		// Set up defaults
		usercache[id] = {
			osrs_username: null
		};
	}

	return usercache[id];
};

// Save user data to database
module.exports.save = function(id) {

};

// Load saved users from database
module.exports.init = async function() {

};

module.exports.cache = usercache;
