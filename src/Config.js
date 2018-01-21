class Config
{
	constructor(id = null)
	{
		this.id = id;
		this.cache = {};
	}

	// Return the value of key
	async get(key)
	{
		return this.cache[key];
	}

	// Set key to some value
	async set(key, value)
	{
		this.cache[key] = value;
	}

	// Remove all keys/values
	async clear()
	{
		this.cache = {};
	}
}

module.exports = Config;
