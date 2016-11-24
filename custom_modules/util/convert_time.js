module.exports = function(seconds)
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
