let Table = root_require('classes/Table');

module.exports.help = {
	name: 'test',
	text: 'A test command.',
	category: 'Admin'
};
module.exports.params = {
	min: 0,
	max: 11111,
	help: `Usage: !test`
};
module.exports.permissions = [];

module.exports.command = async function(message, params) {

	let stats = await apis.RuneScape.lookup_player(params[0], { priority: 1 });
	if (!stats)
		return Discord.code_block('Player not found.');

	let hours = apis.RuneScape.ehp.main.calculate(stats, 13034431);

	let table = new Table();
	table.borders = true;
	table.set_align('ccc', 'lrr');
	
	// table.set_min_width(13, 13, 8);
	table.set_data_format(
		s => s[0].toUpperCase() + s.substr(1), // capitalize skill name
		v => isNaN(v) ? v : util.format_number(v, 0), // Pretty print exp
		v => isNaN(v) ? v : util.format_number(v, 2) // Pretty print ttm
	)

	table.header_row = ['Skill', 'Experience', 'TTM'];

	table.data_rows = apis.RuneScape.skills.map(function(skill) {
		return [
			skill,
			stats[skill].xp,
			hours[skill] == 0 ? '-' : hours[skill]
		];
	});

	return Discord.code_block(table.to_string());
};
