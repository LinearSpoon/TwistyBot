class DiscordSaveData
{
	constructor()
	{
		this.guild_cache = {};
		this.user_cache = {};
	}

	async load_guild(guild_id)
	{
		// Try getting it from the cache
		let data = this.guild_cache[guild_id];
		if (data)
		{
			return data;
		}

		// Else, try getting it from the database
		data = await managers.database.select_one(`SELECT * FROM discord.guilds WHERE id = ?;`, guild_id);

		if (data)
		{
			// Convert from database format to save format

		}
		else
		{
			// Not in the database, make a new save row with the default values
			data = {
				id: guild_id,
				cmd_prefix: '!'
			};
		}

		this.guild_cache[guild_id] = data;
		return data;
	}

	async save_guild(data)
	{
		// Make an object with only the columns in the table
		let save = {
			id: data.id,
			cmd_prefix: data.cmd_prefix
		};

		await managers.database.query(`INSERT INTO discord.guilds SET ? ON DUPLICATE KEY UPDATE ?;`, save, save);
	}

	async load_user(user_id)
	{
		// Try getting it from the cache
		let data = this.user_cache[user_id];
		if (data)
		{
			return data;
		}

		// Else, try getting it from the database
		data = await managers.database.select_one(`SELECT * FROM discord.users WHERE id = ?;`, user_id);

		if (data)
		{
			// Convert from database format to save format

		}
		else
		{
			// Not in the database, make a new save row with the default values
			data = {
				id: user_id
			};
		}

		this.user_cache[user_id] = data;
		return data;
	}

	async save_user(data)
	{
		// Make an object with only the columns in the table
		let save = {
			id: data.id
		};

		await managers.database.query(`INSERT INTO discord.users SET ? ON DUPLICATE KEY UPDATE ?;`, save, save);
	}

}

module.exports = new DiscordSaveData();
