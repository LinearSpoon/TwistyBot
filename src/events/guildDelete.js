// Clear settings when leaving a guild
module.exports = function(guild) {
	console.log(`[Leave Guild] ${ guild.name }`);
	guild.config.clear();
};
