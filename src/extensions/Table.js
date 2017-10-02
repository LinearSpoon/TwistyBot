// Aligns value left, right, or centered padded to the specified width with spaces
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
	constructor(num_columns)
	{
		this.rows = [];
		this.cols = num_columns;

		// Current column alignment
		this._align = 'l'.repeat(num_columns);

		// Current cell format functions
		this._format = Array(num_columns);

		// Minimum width of columns
		this._min_width = Array(num_columns).fill(1);

		// Should borders be used between cells?
		this.borders = true;
	}

	align(a)
	{
		this._align = a;
	}

	format(...f)
	{
		this._format = f;
	}

	min_width(...w)
	{
		this._min_width = w;
	}

	// Push a row of cells into the table
	// If row is undefined, pushes a row of empty cells
	push(row)
	{
		if (row)
		{
			// If there is a format function defined, use it, then convert cell to a string
			row = row.map( (cell, index) => this._format[index] ? this._format[index](cell).toString() : cell.toString() );
		}
		else
		{
			// Push an empty row instead of undefined/null
			row = Array(this.cols).fill('');
		}
		this.rows.push(
			{
				data: row,
				align: this._align
			}
		);
	}

	// Pushes a separator between rows
	separator()
	{
		this.rows.push( { separator: true } );
	}

	// Remove the most recently pushed row or separator
	pop()
	{
		this.rows.pop();
	}

	// Convert the table to a string
	toString()
	{
		// Find column widths
		let col_widths = this.rows.reduce(function(value, row) {
			if (row.separator) { return value; }
			console.log(row.data);
			return row.data.map( (cell, index) => Math.max(cell.length, value[index]) );
		}, this._min_width);

		// Align and pad the data out with spaces
		let aligned = this.rows.map(function(row) {
			if (row.separator) { return row; }
			return row.data.map( (cell, index) => align(cell, col_widths[index], row.align[index]) );
		});

		if (this.borders)
		{
			// Prepare separator row
			let separator = col_widths.map(width => '─'.repeat(width));

			// Top border
			let str = '┌─' + separator.join('─┬─') + '─┐\n';

			// Data columns
			let columns = aligned.map(function(row) {
				if (row.separator)
					return '├─' + separator.join('─┼─') + '─┤';
				else
					return '│ ' + row.join(' │ ') + ' │';
			});

			str += columns.join('\n');

			// Bottom border
			return str + '\n└─' + separator.join('─┴─') + '─┘';
		}
		else
		{
			// Prepare separator row
			let separator = col_widths.map(width => '─'.repeat(width+2));

			// Data columns
			let columns = aligned.map(function(row) {
				if (row.separator)
					return separator.join(' ');
				else
					return ' ' + row.join('   ') + ' ';
			});

			return columns.join('\n');
		}
	}
}

module.exports = Table;
