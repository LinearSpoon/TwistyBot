var cache = {};
database.query('SELECT id, cmd_prefix FROM discord.guilds;')
	.then(function(results) {
		for(var i = 0; i < results.length; i++)
			cache[results[i].id] = results[i].cmd_prefix;
	});


module.exports = function() {
	if (this.guild && cache[this.guild.id])
		return cache[this.guild.id];
	return '!'
};
