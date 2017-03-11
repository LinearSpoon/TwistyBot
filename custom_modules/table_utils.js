// For use with cli-table2

Table = require('cli-table2');

// Return a styleless table
Table.new = function(colWidths) {
	return new Table({colWidths: colWidths || [], style:{head:[],border:[]}});
};

const no_top = { 'left-mid': '', 'right-mid': '', 'mid': '', 'mid-mid': '' };
const debug = { 'top': '1' , 'top-mid': '2' , 'top-left': '3' , 'top-right': '4',
	'bottom': '5' , 'bottom-mid': '6' , 'bottom-left': '7' , 'bottom-right': '8',
	'left': '9' , 'left-mid': '0' , 'mid': 'A' , 'mid-mid': 'B',
	'right': 'C' , 'right-mid': 'D' , 'middle': 'E' };


Table.cell = function(content, opts) {
	var cell = { content: content };
	if (!opts)
		return cell;
	opts = opts.split(' ');
	for(var i in opts)
	{
		var option = opts[i];
		if (option == 'no-top')
			cell.chars = no_top;
		else if (option == 'debug')
			cell.chars = debug;
		else if (option == 'left' || option == 'center' || option == 'right')
			cell.hAlign = option;
		else if (option == 'top' || option == 'bottom')
			cell.vAlign = option;
		else if (option == 'middle')
			cell.vAlign = 'center';
		else
		{
			var match = option.match(/col(\d+)/);
			if (match)
				cell.colSpan = parseInt(match[1]);
			var match = option.match(/row(\d+)/);
			if (match)
				cell.rowSpan = parseInt(match[1]);
		}
	}
	return cell;
};

// Return a cell of right aligned, pretty printed floats
Table.floats = function(content, num_decimals) {
	num_decimals = typeof num_decimals === 'undefined' ? 2 : num_decimals;
	return Table.cell(content
		.map(v => isNaN(v) ? v : util.format_number(v, num_decimals))
		.join('\n'),
	'right');
};

// Return a cell of right aligned, pretty printed integers
Table.ints = function(content) {
	return Table.cell(content
		.map(v => isNaN(v) ? v : util.format_number(v, 0))
		.join('\n'),
	'right');
};

// Return a cell of left aligned, pretty printed strings
Table.strings = function(content, num_decimals) {
	return Table.cell(content.join('\n'));
};

// Return a row of centered column headers
Table.headers = function(...content) {
	return content.map(h => Table.cell(h, 'center'));
};
