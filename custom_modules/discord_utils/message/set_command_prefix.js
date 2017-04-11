module.exports = function(prefix) {
	if (this.guild)
		Discord.cmd_prefix_cache[this.guild.id] = prefix;
	return database.query('INSERT INTO discord.guilds SET id=?, cmd_prefix=? ON DUPLICATE KEY UPDATE cmd_prefix=?;', this.guild.id, prefix, prefix);
};
