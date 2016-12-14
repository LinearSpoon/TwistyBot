var moment = require("moment-timezone");

const time_format = 'MMM D, h:mm A z';
//console.log(moment.tz.names())

module.exports = async function(params) {
	var now = moment();

	return util.dm.code_block(
		'TwistyBot:   ' + now.tz('UTC').format(time_format) +
		'\nEastern US:  ' + now.tz('America/New_York').format(time_format) +
		'\nCentral US:  ' + now.tz('America/Chicago').format(time_format) +
		'\nMountain US: ' + now.tz('America/Phoenix').format(time_format) +
		'\nPacific US:  ' + now.tz('America/Los_Angeles').format(time_format) +
		'\nJagex:       ' + now.tz('Europe/London').format(time_format) +
		'\nAsk for other time zones if you want to see them here'
	);
};
