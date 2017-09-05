let Connection = src_require('classes/Connection');

async function load(id) {
	return twistybot.cache.guilds.get(id, async function() {
		let data = await Connection.select_one(`SELECT * FROM discord.guilds WHERE id = ?;`, id);
		if (data)
		{
			// Convert from database format...

		}
		else
		{
			// Not found, return the default values
			return {
				id: id,
				cmd_prefix: '!'
			};
		}
	});
}

async function save(data) {
	twistybot.cache.guilds.set(data.id, data);
	// Make an object with only the columns in the table
	let save = {
		id: data.id,
		cmd_prefix: data.cmd_prefix
	};

	await Connection.query(`INSERT INTO discord.guilds SET ? ON DUPLICATE KEY UPDATE ?;`, save, save);
}

module.exports.load = load;
module.exports.save = save;
