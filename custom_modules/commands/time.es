var moment = require("moment-timezone");

const time_format = 'MMM D, hh:mm A z';
//console.log(moment.tz.names())

// https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
// https://www.timeanddate.com/time/map/
module.exports.help = {
	name: 'time',
	text: 'Display the current time in different time zones.',
	category: 'General'
};
module.exports.params = {
	min: 0,
	max: 999,
	help: `Usage: !time`
};
module.exports.whitelist = null;

module.exports.command = async function(client, message, params) {
	var now = moment();

	return util.dm.code_block(
		'Bot Time:      ' + now.tz('UTC').format(time_format) +
		'\nEastern US:    ' + now.tz('America/New_York').format(time_format) +
		'\nCentral US:    ' + now.tz('America/Chicago').format(time_format) +
		'\nMountain US:   ' + now.tz('America/Phoenix').format(time_format) +
		'\nPacific US:    ' + now.tz('America/Los_Angeles').format(time_format) +
		'\nJagex:         ' + now.tz('Europe/London').format(time_format) +
		'\nNE Australia:  ' + now.tz('Australia/Brisbane').format(time_format) +
		'\nSE Australia:  ' + now.tz('Australia/Melbourne').format(time_format) +
		'\nAsk for other time zones if you want to see them here'
	);
};
