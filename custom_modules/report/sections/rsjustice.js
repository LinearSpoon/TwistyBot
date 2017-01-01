// Find members who had an entry in rsjustice
module.exports = function(clan_list) {
	var report = clan_list
		.filter(member => typeof member.rsjustice !== 'undefined')
		.map(member => member.id + ': ' + member.name + ' ' + member.rsjustice.url);

	var output = 'Members on RSJustice: ' + report.length + '\n' + report.join('\n');
	if (apis.RSJustice.is_limited())
		output += util.dm.bold('Warning: RSJustice api is currently limited, report may not include all members.\n');
	return output;
};
