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
	constructor(num_columns, borders = true)
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
		this.borders = borders;
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
	push(...row)
	{
		if (row.length > 0)
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

	// Push a "header" row (all centered, with a separator below it)
	header(...row)
	{
		this.align('c'.repeat(this.cols));
		this.push(...row);
		this.div();
	}

	// Push a "full width" centered row
	full(value)
	{
		this.rows.push( { full: true, data: value } );
	}

	// Pushes a separator between rows
	div()
	{
		this.rows.push( { separator: true } );
	}

	// Remove the most recently pushed row or separator
	pop()
	{
		this.rows.pop();
	}

	// Remove all rows from the table
	empty()
	{
		this.rows = [];
	}

	// Convert the table to a string
	toString()
	{
		// Find column widths and total width
		let col_widths = this.rows.reduce(function(widths, row) {
			if (row.separator) { return widths; }
			if (row.full) { return widths; }
			return row.data.map( (cell, index) => Math.max(cell.length, widths[index]) );
		}, this._min_width);

		let full_width = col_widths.reduce((a, v) => a + v, 0) + 3 * this.cols - 3;

		// Align and pad the data out with spaces
		let aligned = this.rows.map(function(row) {
			if (row.separator) { return row; }
			if (row.full) { return row; }
			return row.data.map( (cell, index) => align(cell, col_widths[index], row.align[index]) );
		});

		if (this.borders)
		{
			// Prepare separator row
			let separator = col_widths.map(width => '─'.repeat(width));

			let normal = '─┼─';
			let full_above = '─┬─';
			let full_below = '─┴─';
			let full_above_below = '───';

			let str = '';

			console.log(aligned);

			// Top border
			if (aligned.length > 0 && aligned[0].full)
				str += '┌─' + separator.join(full_above_below) + '─┐\n';
			else
				str += '┌─' + separator.join(full_above) + '─┐\n';

			// Data columns
			let columns = aligned.map(function(row, index) {
				if (row.separator)
				{
					let above = aligned[index-1] && aligned[index-1].full; // Is there a full row above?
					let below = aligned[index+1] && aligned[index+1].full; // Is there a full row below?

					if (above && below)
						return '├─' + separator.join(full_above_below) + '─┤';
					if (above)
						return '├─' + separator.join(full_above) + '─┤';
					if (below)
						return '├─' + separator.join(full_below) + '─┤';

					return '├─' + separator.join(normal) + '─┤';
				}

				if (row.full)
				{
					return '│ ' + align(row.data, full_width, 'c') + ' │';
				}

				return '│ ' + row.join(' │ ') + ' │';
			});

			str += columns.join('\n');

			// Bottom border
			if (aligned.length > 0 && aligned[aligned.length - 1].full)
				str += '\n└─' + separator.join(full_above_below) + '─┘';
			else
				str += '\n└─' + separator.join(full_below) + '─┘';

			return str;
		}
		else
		{
			// Prepare separator row
			let separator = col_widths.map(width => '─'.repeat(width+2));

			// Data columns
			let columns = aligned.map(function(row) {
				if (row.separator)
					return separator.join(' ');
				if (row.full)
					return ' ' + align(row.data, full_width, 'c') + ' ';

				return ' ' + row.join('   ') + ' ';
			});

			return columns.join('\n');
		}
	}
}

module.exports = Table;
