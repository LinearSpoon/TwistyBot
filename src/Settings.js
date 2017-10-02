class Settings
{
	constructor(id)
	{
		this.id = id;
		this.cache = {};
	}

	async get(key)
	{
		return this.cache[key];
	}

	async set(key, value)
	{
		this.cache[key] = value;
	}
}

module.exports = Settings;
