module.exports.help = {
	name: 'test',
	text: 'A test command.',
	category: 'Admin'
};
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !test`
};
module.exports.permissions = [];

var Table = require('cli-table2');

module.exports.command = async function(client, message, params) {
	var table = new Table({colWidths: [15, 15, 10], style:{head:[],border:[]}});
	table.push([ // Header
		Table.cell('Skill', 'center'),
		Table.cell('Experience', 'center'),
		Table.cell('TTM', 'center'),
	]);

	table.push([Table.cell('a\nb\nc\nd', 'right'), '1', '2']);
	table.push([Table.cell('a\nbbb\ncccc\ndd', 'center'), '1', '2']);
	table.push([Table.cell('a\nb\nc\nd', 'right'), '1', '2']);


	return Discord.code_block(table.toString());
};
