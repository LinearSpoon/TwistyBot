let mysql = require('mysql');

class Connection
{
	constructor(pool)
	{
		// Only get a connection from the pool when we need it for a query
		this.pool = pool;
		// Are we actually in a transaction?
		this.transaction = false;
		// Do we have a transaction pending in the buffer?
		this.want_transaction = false;
		// A buffer for sql that is waiting to be sent out
		this.sql_buffer = [];
	}

	// Internal use only
	// Allocate a connection from the pool and save in this.connection
	get_connection()
	{
		return new Promise( (resolve, reject) => {
			this.pool.getConnection(function(err, connection) {
				if (err)
				{
					console.error(err.message);
					return reject(err);
				}

				console.log('Connection allocated');
				this.connection = connection;
				return resolve();
			});
		});
	}

	// Internal use only
	// Runs sql code on the database
	run_sql(sql, ...params)
	{
		let timebegin = process.hrtime();
		return new Promise( (resolve, reject) => {
			let cid = this.connection.threadId;
			let query = this.connection.query(sql.replace(/\n\s*/g,'\n'), params, function(err, results) {
				// Calculate execution time
				let timediff = process.hrtime(timebegin);
				let querytime = (timediff[0] * 1000 + timediff[1] / 1000000).toFixed(2);

				if (err)
				{
					// Also see err.code, err.errno
					console.warn(`[${cid}][${querytime} ms] ` + query.sql + ' threw error ' + err.sqlState + '. ' + err.message);
					return reject(err);
				}
				else
				{
					// Trim long output
					if (query.sql.length > 1500)
						query.sql = query.sql.substr(0, 1499);
					console.info(`[${cid}][${querytime} ms] ` + query.sql);
					return resolve(results);
				}
			});
		});
	}

	// Execute a query and return the result
	async query(...params)
	{
		if (!this.connection)
			this.connection = await this.get_connection();

		// Run pending queries first...
		await this.flush();

		return this.run_sql(...params);
	}

	// Execute a query and return the first result
	async select_one(...params)
	{
		let results = await this.query(...params);
		return results[0];
	}

	// Queue up a query that doesn't need immediate execution
	// Calling flush() will run all the buffered queries in one request for better performance
	buffer(sql, ...params)
	{
		this.sql_buffer.push(mysql.format(sql, params));
	}

	async flush()
	{
		if (this.sql_buffer.length == 0)
			return; // Nothing to do

		if (!this.connection)
			this.connection = await this.get_connection();

		// Send queries and empty the buffer
		await this.run_sql(this.sql_buffer.join('\n'));
		this.sql_buffer = [];

		// Check if there was a transaction in the buffer and flip the flags
		if (this.want_transaction)
		{
			this.transaction = true;
			this.want_transaction = false;
		}
	}

	start_transaction()
	{
		// Only buffer a transaction if we are not already in one
		if (!this.want_transaction && !this.transaction)
		{
			this.buffer('START TRANSACTION;');
			this.want_transaction = true;
		}
	}

	async	commit()
	{
		if (this.want_transaction && this.sql_buffer[this.sql_buffer.length - 1] == 'START TRANSACTION;')
		{ // This is a transaction followed immediately by commit (a no-op), remove the pending transaction and don't commit
			this.sql_buffer.pop();
			this.want_transaction = false;
			// But flush the buffer anyway
			return await this.flush();
		}
		if (this.want_transaction || this.transaction)
		{
			await this.query('COMMIT;');
			this.transaction = false;
			// this.want_transaction should be set to false when flushing
		}
	}

	async rollback()
	{
		if (this.want_transaction)
		{ // We have a transaction in the buffer
			// Every query after that is going to be erased by the rollback anyway, so pop them out of the buffer
			while( this.sql_buffer.pop() !== 'START TRANSACTION;' );
				// no while body

			this.want_transaction = false;
			return await this.flush();
		}

		if (this.transaction)
		{ // We are actually in a transaction, we need to send rollback
			// Anything in the buffer is going to get erased anyway, so empty it before this.query tries to flush it
			this.sql_buffer = [];
			await this.query('ROLLBACK;');
			this.transaction = false;
		}
	}

	async commit_release()
	{
		try
		{
			await this.commit();
			this.release();
		}
		catch(err)
		{
			// If one of the queries in the buffer throws an exception, we still need to release
			this.release();
			throw err;
		}
	}

	async rollback_release()
	{
		try
		{
			await this.rollback();
			this.release();
		}
		catch(err)
		{
			// If one of the queries in the buffer throws an exception, we still need to release
			this.release();
			throw err;
		}
	}

	release()
	{
		if (this.connection)
		{
			if (this.sql_buffer.length > 0)
			{
				console.log(this.sql_buffer);
				console.warn('Connection released without flushing buffer!!!');
			}

			this.connection.release();
			// Reset variables
			delete this.connection;
			this.transaction = false;
		}
	}
}

module.exports = Connection;
