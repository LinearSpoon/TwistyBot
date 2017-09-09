class Timer
{
	constructor()
	{
		this.begintime = process.hrtime();
	}

	reset()
	{
		this.begintime = process.hrtime();
	}

	check()
	{
		let timediff = process.hrtime(this.begintime);
		return (timediff[0] * 1000 + timediff[1] / 1000000).toFixed(2);
	}
}

module.exports = Timer;
