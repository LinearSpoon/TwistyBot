// node_modules
var mysql = require('mysql');
var Connection = require('mysql/lib/Connection');

const connection_max_time = 30 * 60 * 1000;  // min * sec * ms

var dbpool = mysql.createPool({
	connectionLimit : 15,
	host     : config.get('database_hostname'),
	user     : config.get('database_username'),
	password : config.get('database_password'),
	database : config.get('database_schema'),
	multipleStatements : true,
	timezone : 'Z'  // UTC time
});

function find_good_connection(resolve, reject)
{
	dbpool.getConnection(function(err, connection) {
		if (err)
		{
			console.error(err.message);
			return reject(err);
		}

		if (!connection.creation_date)
		{ // This is a new connection
			//console.log("Connection created!");
			connection.creation_date = Date.now();
		}

		if (Date.now() - connection.creation_date > connection_max_time)
		{ // Connection is really old, destroy it and get a new one
			//console.log("Connection expired!");
			connection.destroy();
			return find_good_connection(resolve, reject);
		}

		return resolve(connection);
	});
};

// Run a one off query (same args as Connection.query)
module.exports.query = function(...args) {
	return new Promise(find_good_connection)
		.then(function(connection) {
			// Make sure connection is always released
			return connection.query.apply(connection, args)
				.then(function(results) {
					connection.release();
					return results;
				})
				.catch(function(err) {
					connection.release();
					throw err;
				});
		})
};

// Return connection for running multiple queries
module.exports.get_connection = function() {
	return new Promise(find_good_connection);
};

// Override default query function to return a promise
var OriginalQuery = Connection.prototype.query;
Connection.prototype.query = function(sql, ...params) {
	var self = this;
	return new Promise(function(resolve, reject) {
		var q = OriginalQuery.call(self, sql, params, function(err, results, fields) {
			if (err)
			{
				// Also see err.code, err.errno
				console.warn(q.sql + ' threw error ' + err.sqlState + '. ' + err.message);
				return reject(err);
			}
			else
			{
				console.log(q.sql);
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
