// Find members who had an entry in rsjustice
module.exports = function(clan_list) {
	var report = clan_list
		.filter(member => typeof member.rsjustice !== 'undefined')
		.map(member => member.id + ': ' + member.name + ' ' + member.rsjustice.url);

	return 'Members on RSJustice: ' + report.length + '\n' + report.join('\n');
};
