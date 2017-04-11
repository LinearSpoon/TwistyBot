Discord.cmd_prefix_cache = {};
database.query('SELECT id, cmd_prefix FROM discord.guilds;')
	.then(function(results) {
		for(var i = 0; i < results.length; i++)
			Discord.cmd_prefix_cache[results[i].id] = results[i].cmd_prefix;
	});

module.exports = function() {
	if (this.guild && Discord.cmd_prefix_cache[this.guild.id])
		return Discord.cmd_prefix_cache[this.guild.id];
	return '!'
};
