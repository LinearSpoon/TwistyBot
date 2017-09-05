let Connection = src_require('classes/Connection');

async function load(id) {
	return twistybot.cache.users.get(id, async function() {
		let data = await Connection.select_one(`SELECT * FROM discord.users WHERE id = ?;`, id);
		if (data)
		{
			// Convert from database format...

		}
		else
		{
			// Not found, return the default values
			return {
				id: id
			};
		}
	});
}

async function save(data) {
	twistybot.cache.users.set(data.id, data);
	// Make an object with only the columns in the table
	let save = {
		id: data.id
	};

	await Connection.query(`INSERT INTO discord.users SET ? ON DUPLICATE KEY UPDATE ?;`, save, save);
}

module.exports.load = load;
module.exports.save = save;
