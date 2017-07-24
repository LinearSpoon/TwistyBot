function align(value, width, alignment)
{
	switch(alignment)
	{
		// Center aligned (pad both sides with an even number of spaces)
		case 'c':
			return value.padStart( value.length + Math.ceil((width-value.length)/2) ).padEnd( width );
		// Right aligned (pad start with spaces)
		case 'r':
			return value.padStart(width);
		// Left aligned (pad end with spaces)
		case 'l': default:
			return value.padEnd(width);
	}
}

class Table
{
	constructor()
	{
		// Values used in each cell
		this.header_row = [];
		this.data_rows = [];

		// Alignment of columns
		this.header_align = null;
		this.data_align = null;

		// Functions used to format cell values
		this.header_format = null;
		this.data_format = null;

		// Minimum width of columns
		this.min_width = null;

		// Should borders be used between cells?
		this.borders = true;
	}

	set_align(header, data)
	{
		this.header_align = header.split('');
		this.data_align = data.split('');
	}

	set_header_format(...fns)
	{
		this.header_format = fns;
	}

	set_data_format(...fns)
	{
		this.data_format = fns;
	}

	set_min_width(...widths)
	{
		this.min_width = widths;
	}

	to_string()
	{
		// Check number of columns
		let num_columns = this.header_row.length;
		if ( this.data_rows.some( row => row.length != num_columns) )
			console.warn('Number of data columns does not match number of header columns!');

		// Format header columns
		let header_format = this.header_format || Array(num_columns);
		if (header_format.length != num_columns)
			console.warn('header_format column amount mismatch');
		let header = this.header_row.map( (value, index) => header_format[index] ? header_format[index](value).toString() : value.toString() );

		// Format data columns
		let data_format = this.data_format || Array(num_columns);
		if (data_format.length != num_columns)
			console.warn('data_format column amount mismatch');
		let data = this.data_row = this.data_rows.map( function(row) {
			return row.map( (value, index) => data_format[index] ? data_format[index](value).toString() : value.toString() );
		});

		// Determine widths of each column
		let min_width = this.min_width || Array(num_columns).fill(1);
		if (min_width.length != num_columns)
			console.warn('min_width column amount mismatch');
		min_width = header.map( function(value, index) {
			// The min width is the max of min_width, header length, and all data lengths of this column
			return Math.max( min_width[index], value.length, ...data.map(row => row[index].length) );
		});

		// Align headers according to min_width and header_align
		let header_align = this.header_align || Array(num_columns).fill('l');
		if (header_align.length != num_columns)
			console.warn('header_align column amount mismatch');
		header = header.map( (value, index) => align(value, min_width[index], header_align[index]) );

		// Align data columns the same way
		let data_align = this.data_align || Array(num_columns).fill('l');
		if (data_align.length != num_columns)
			console.warn('data_align column amount mismatch');
		data = data.map( function(row) {
			return row.map( (value, index) => align(value, min_width[index], data_align[index]) );
		});

		// Join the columns into strings
		if (this.borders)
		{
			header = '│ ' + header.join(' │ ') + ' │';
			data = data.map( row => '│ ' + row.join(' │ ') + ' │' );
		}
		else
		{
			header = ' ' + header.join('   ') + ' ';
			data = data.map( row => ' ' + row.join('   ') + ' ');
		}

		// Join the row strings into the final table
		if (this.borders)
		{
			let dividers = min_width.map( value => Array(value+1).join('─') );

			// Top row
			let str = '┌─' + dividers.join('─┬─') + '─┐\n';
			// Header
			str += header + '\n';
			// Border between header and data
			str += '├─' + dividers.join('─┼─') + '─┤\n';
			// Data
			str += data.join('\n') + '\n';
			// Bottom border
			return str + '└─' + dividers.join('─┴─') + '─┘';
		}
		else
		{
			let dividers = min_width.map( value => Array(value+3).join('─') );

			// Header
			let str = header + '\n';
			// Border between header and data
			str += dividers.join(' ') + '\n';
			// Data
			return str + data.join('\n');
		}
	}
}

module.exports = Table;
