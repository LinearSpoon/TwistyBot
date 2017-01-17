// Find members who had an entry in rsjustice
module.exports = function(clan_list) {
	var report = clan_list
		.filter(member => member.rsjustice.length > 0)
		.map(member => member.id + ': ' + member.name + ' ' + member.rsjustice[0].url);

	var output = 'Members on RSJustice: ' + report.length + '\n' + report.join('\n');
	return output;
};
