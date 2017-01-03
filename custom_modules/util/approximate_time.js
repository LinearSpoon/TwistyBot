const one_second = 1000;
const one_minute = 60 * one_second;
const one_hour = 60 * one_minute;
const one_day = 24 * one_hour;
const one_week = 7 * one_day;

module.exports = function(milliseconds) {
	if (milliseconds > 2 * one_week)
		return Math.floor(milliseconds / one_week) + ' weeks';
	if (milliseconds > 2 * one_day)
		return Math.floor(milliseconds / one_day) + ' days';
	if (milliseconds > 2 * one_hour)
		return Math.floor(milliseconds / one_hour) + ' hours';
	if (milliseconds > 2 * one_minute)
		return Math.floor(milliseconds / one_minute) + ' minutes';
	// else
	return Math.floor(milliseconds / one_second) + ' seconds';
};
