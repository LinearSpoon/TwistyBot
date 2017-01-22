const one_second = 1000;
const one_minute = 60 * one_second;
const one_hour = 60 * one_minute;
const one_day = 24 * one_hour;
const one_week = 7 * one_day;

module.exports = function(t1, t2) {
	if (typeof(t1) === 'number')
		t1 = new Date(t1);
	if (typeof(t2) === 'number')
		t2 = new Date(t2);

	if (t1 > t2)
	{ // swap so t1 is always the earlier date
		var tmp = t2;
		t2 = t1;
		t1 = tmp;
	}

	// Caclulate number of months based on the starting date
	// Jan 3rd to March 4th = 3 months
	// Jan 3rd to March 1st = 2 months
	var elapsed_months =
		(t2.getUTCMonth() + t2.getUTCFullYear() * 12) -
		(t1.getUTCMonth() + t1.getUTCFullYear() * 12);

	if (t1.getUTCDate() > t2.getUTCDate())
	{
		elapsed_months = elapsed_months - 1;
	}
	if (elapsed_months > 48)
		return Math.floor(elapsed_months / 12) + ' years';

	if (elapsed_months > 4)
		return elapsed_months + ' months';

	var milliseconds = t2 - t1;
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
