class Cache
{
	// ttl = time to live in milliseconds
	constructor(ttl)
	{
		this.ttl = ttl || 300000;
		this.data = {};
	}

	// Retrieve a value from the cache
	// If the value is not found and a fallback function is provided, fallback will
	// be called and its return value will be set in the cache and returned
	async get(key, fallback)
	{
		let data = this.data[key];
		if (data)
		{
			// console.log('FOUND: ' + key);
			data.last_access = Date.now();
			return data.value;
		}
		if (typeof fallback === 'function')
		{
			// Don't cache undefined
			let value = await fallback();
			if (value !== undefined)
				return this.set(key, value);
		}
	}

	// Same as get, but synchronous
	getsync(key, fallback)
	{
		let data = this.data[key];
		if (data)
		{
			// console.log('FOUND: ' + key);
			data.last_access = Date.now();
			return data.value;
		}
		if (typeof fallback === 'function')
		{
			// Don't cache undefined
			let value = fallback();
			if (value !== undefined)
				return this.set(key, value);
		}
	}

	// Add a value to the cache
	set(key, value)
	{
		this.data[key] = {
			last_access: Date.now(),
			value: value
		};
		return value;
	}

	// Remove a value from the cache
	remove(key)
	{
		delete this.data[key];
	}

	// Removes expired values from the cache
	clean()
	{
		let count_removed = 0;
		let expired_time = Date.now() - this.ttl;
		for(var key in this.data)
		{
			if (this.data[key].last_access < expired_time)
			{
				delete this.data[key];
				count_removed += 1;
			}
		}
		return count_removed;
	}

	// Return an array of cache keys
	keys()
	{
		return Object.keys(this.data);
	}
}

module.exports = Cache;
