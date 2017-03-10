// For use with cli-table2

const no_top = { 'left-mid': '', 'right-mid': '', 'mid': '', 'mid-mid': '' };
const debug = { 'top': '1' , 'top-mid': '2' , 'top-left': '3' , 'top-right': '4',
	'bottom': '5' , 'bottom-mid': '6' , 'bottom-left': '7' , 'bottom-right': '8',
	'left': '9' , 'left-mid': '0' , 'mid': 'A' , 'mid-mid': 'B',
	'right': 'C' , 'right-mid': 'D' , 'middle': 'E' };


require('cli-table2').cell = function(content, opts) {
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
