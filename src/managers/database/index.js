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

// Run a one off query
module.exports.query = async function(...params) {
	let con = new Connection(pool);
	try
	{
		let result = await con.query(...params);
		con.release();
		return result;
	}
	catch(err)
	{
		con.release();
	}
};

module.exports.select_one = async function(...params) {
	let con = new Connection(pool);
	try
	{
		let result = await con.select_one(...params);
		con.release();
		return result;
	}
	catch(err)
	{
		con.release();
	}
};
