module.exports.user = require('./user');
module.exports.guild = require('./guild');


module.exports.init = async function() {
	console.log('TwistyBot cache init begin');
	// Don't catch here, the bot should crash if we can't load the cache
	await module.exports.user.init();
	await module.exports.guild.init();
	console.log('TwistyBot cache init finished');
};
