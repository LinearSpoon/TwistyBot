var report = custom_require('report');
var moment = require('moment-timezone');

module.exports.help = {
	name: 'report',
	text: 'View clan statistics.',
	category: 'Deities'
};
module.exports.params = {
	min: 0,
	max: 1,
	help: `Usage: !report`
};
module.exports.permissions = [
	{ role: '160842785610661888', guild: '160833724886286336' }  // Council role in Deities guild
];

module.exports.command = async function(message, params) {
	if (params[0] == 'update')
		await report.update_sources();

	var results = await report.check_all();
	var report_str = 'Report time: ' + moment(report.end_date).format('MMM D, h:mm A') + '\n\n';

	for(var i in results.sections)
	{
		if (results.sections[i].data.length > 0)
		{
			report_str += results.sections[i].title + '\n' + Discord.code_block(results.sections[i].header + results.sections[i].data.join('\n'));
		}
	}

	return report_str;
}
