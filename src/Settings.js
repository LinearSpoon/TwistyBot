class Settings
{
	constructor(id)
	{
		this.id = id;
		this.cache = {};
	}

	async get(key, default_value)
	{
		if (typeof this.cache[key] === 'undefined' && typeof default_value !== 'undefined')
			await this.set(key, default_value);

		return this.cache[key];
	}

	async set(key, value)
	{
		this.cache[key] = value;
	}
}

module.exports = Settings;
