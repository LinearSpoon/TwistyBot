let mysql = require('mysql');
let Connection = require('./Connection');

// config must define 'host', 'user', 'password', and 'database'
let pool = mysql.createPool( Object.assign(
	{
		connectionLimit: 15,
		multipleStatements: true,
		timezone: 'Z'
	},
	config.get('database')
));

module.exports.get_connection = () => new Connection(pool);
module.exports.format_sql = (sql, ...params) => mysql.format(sql.replace(/\n\s*/g,'\n'), params);
