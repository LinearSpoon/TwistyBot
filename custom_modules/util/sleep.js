// Returns a promise that resolves after the specified amount of time in milliseconds
module.exports = function(time_ms)
{
	return new Promise((resolve,reject) => setTimeout(resolve, time_ms));
}
