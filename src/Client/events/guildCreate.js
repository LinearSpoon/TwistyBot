// Reset settings for a guild when joining
module.exports = function(guild) {
	console.log(`[Join Guild] ${ guild.name }`);
	guild.config.clear();
};
