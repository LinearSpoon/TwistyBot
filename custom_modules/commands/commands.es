module.exports = async function(params) {
	return util.dm.table([
		['!price', 'Retrieves price of items from RSBuddy.'],
		['!update', 'Updates a single player on CrystalMathLabs.'],
		//['!inactive', 'Retrieves inactive clanmates from CrystalMathLabs.'],
		['!stats', 'Display OldSchool player stats.'],
		['!cb', 'Display OldSchool player combat stats.'],
		['!rsj', 'Lookup a player on RS Justice.'],
		['!report', 'View daily clan report.'],
		//['!sandwich', 'Prepare a tasty sandwich.'],
		['!help', 'Display music commands (only in the music channel).'],
	], [15]);
};
