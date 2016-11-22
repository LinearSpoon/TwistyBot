

module.exports.convert_seconds_to_time_str = function(seconds)
{
	var temp;
	var ts = '';

	// Intentional assignment in comparison
	if (temp = Math.floor(seconds / 604800)) {
		ts += temp + (temp == 1 ? ' week' : ' weeks');
		seconds %= 604800;
	}
	if (temp = Math.floor(seconds / 86400)) {
		ts += (ts.length > 0 ? ', ' : '') + temp + (temp == 1 ? ' day' : ' days');
		seconds %= 86400;
	}
	if (temp = Math.floor(seconds / 3600)) {
		ts += (ts.length > 0 ? ', ' : '') + temp + (temp == 1 ? ' hour' : ' hours');
		seconds %= 3600;
	}
	if (temp = Math.floor(seconds / 60)) {
		ts += (ts.length > 0 ? ', ' : '') + temp + (temp == 1 ? ' minute' : ' minutes');
		seconds %= 60;
	}
	if (seconds) {
		ts += (ts.length > 0 ? ', ' : '') + seconds + (seconds == 1 ? ' second' : ' seconds');
	}

	return ts;
};

module.exports.convert_seconds_to_time_object = function(seconds)
{
	var to = {};
	to.weeks = Math.floor(seconds / 604800);
	seconds %= 604800;
	to.days = Math.floor(seconds / 86400);
	seconds %= 86400;
	to.hours = Math.floor(seconds / 3600);
	seconds %= 3600;
	to.minutes = Math.floor(seconds / 60);
	to.seconds = seconds % 60;
	return to;
};
