// Find members who had an entry in rsjustice
module.exports = function(clan_list) {
	var report = clan_list
		.filter(member => typeof member.rsjustice.length > 0)
		.map(member => member[0].id + ': ' + member[0].name + ' ' + member[0].rsjustice.url);

	var output = 'Members on RSJustice: ' + report.length + '\n' + report.join('\n');
	return output;
};
