var mysql = require('mysql');
var Connection = require('mysql/lib/Connection');
var Pool = require('mysql/lib/Pool');

// options should include host, user, password, and database
module.exports = function(options) {
	options.connectionLimit = 15;
	options.multipleStatements = true;
	options.timezone = 'Z'; // UTC time
	var pool = mysql.createPool( options );

	// Assign a creation date to new connections
	pool.on('connection', function(connection) {
		connection.creation_date = Date.now();
	});

	return pool;
};

//const connection_max_time = 30 * 60 * 1000;  // min * sec * ms
Pool.prototype.get_connection = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.getConnection(function(err, connection) {
			if (err)
			{
				console.error(err.message);
				return reject(err);
			}

			// if (Date.now() - connection.creation_date > connection_max_time)
			// { // Connection is really old, destroy it and get a new one
			// 	//console.log("Connection expired!");
			// 	connection.destroy();
			// 	return find_good_connection(resolve, reject);
			// }

			return resolve(connection);
		});
	});
};

// Run a one off query (same args as Connection.query)
Pool.prototype.query = async function(...args) {
	var connection = await this.get_connection();
	// Always ensure connection is released
	return connection.query.apply(connection, args)
		.then(function(results) {
			connection.release();
			return results;
		})
		.catch(function(err) {
			connection.release();
			throw err;
		});
};

// Override default query function to return a promise
var OriginalQuery = Connection.prototype.query;
Connection.prototype.query = function(sql, ...params) {
	var self = this;
	return new Promise(function(resolve, reject) {
		var q = OriginalQuery.call(self, sql.replace(/\n\s*/g,'\n'), params, function(err, results, fields) {
			if (err)
			{
				// Also see err.code, err.errno
				console.warn(q.sql + ' threw error ' + err.sqlState + '. ' + err.message);
				return reject(err);
			}
			else
			{
				if (q.sql.length > 1500)
					q.sql = q.sql.substr(0, 1499);
				console.info(q.sql);
				return resolve(results);
			}
		});
	});
};

// Override some convenience functions to also return promises
Connection.prototype.start_transaction = function() {
	return this.query('START TRANSACTION;');
};

Connection.prototype.commit = function() {
	return this.query('COMMIT;');
};

Connection.prototype.rollback = function() {
	return this.query('ROLLBACK;');
};

// Return SQL string with ? replaced by parameters
Pool.prototype.format_sql = function(sql, ...params) {
	return mysql.format(sql.replace(/\n\s*/g,'\n'), params);
};

Connection.prototype.format_sql = function(sql, ...params) {
	return mysql.format(sql.replace(/\n\s*/g,'\n'), params);
};
