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
	constructor(theme = 'default')
	{
		// Table data rows
		this.rows = [];

		// Table theme
		this.theme = theme;

		// Number of columns in the table
		this.width = 0;

		// Minimum column widths
		this.minw = [];
	}

	align(a)
	{
		this.alignment = a;
	}

	min_width(...w)
	{
		this.minw = w;
	}

	// Push a row of cells into the table
	// If nothing is passed, pushes a row of empty cells
	push(...row)
	{
		this.rows.push({
			type: 'data',
			align: this.alignment || 'l'.repeat(row.length),
			data: row.map(String),
			div: false
		});

		this.width = Math.max(this.width, row.length);
	}

	// Push a "header" row (all centered, with a separator below it)
	header(...row)
	{
		this.rows.push({
			type: 'data',
			align: 'c'.repeat(row.length),
			data: row.map(String),
			div: true
		});

		this.width = Math.max(this.width, row.length);
	}

	// Push a "full width" centered row
	full(value)
	{
		this.rows.push({
			type: 'full',
			data: String(value),
			div: false
		});

		this.width = Math.max(this.width, 1);
	}

	// Pushes a separator between rows
	div()
	{
		if (this.rows.length > 0)
		{
			this.rows[this.rows.length - 1].div = true;
		}
	}

	// Remove the most recently pushed row or separator
	pop()
	{
		this.rows.pop();
		// Update the column count
		this.width = this.rows.reduce(
			(width, row) => Math.max(row.type == 'full' ? 1 : row.data.length, width),
			0
		);
	}

	// Remove all rows from the table
	empty()
	{
		this.rows = [];
		this.width = 0;
	}

	// Process the table rows to make it "square", ie all columns are the same width
	_make_square()
	{
		let width = this.width;
		return this.rows.map(function(row)
		{
			if (row.type != 'data') { return row; }

			// Make a copy of the row, padding if it is too short
			return {
				type: 'data',
				data: row.data.concat(Array(width - row.data.length).fill('')),
				align: row.align + 'l'.repeat(width - row.align.length),
				div: row.div
			};
		});
	}

	// Convert the table to a string
	toString()
	{
		if (this.length == 0)
			return '';
		
		// Make a square copy of the table
		let table = this._make_square();

		// Get the theme variables
		let theme = Table.themes[this.theme] || Table.themes.default;

		// Determine total column width (characters)
		let col_widths = [];
		// For each column...
		for (let i = 0; i < this.width; i++)
		{
			let width = this.minw[i] || 0;

			// Find maximum column width
			table.forEach(function(row) {
				if (row.type == 'data' && row.data[i].length > width)
					width = row.data[i].length;
			});

			// Add padding
			// width += theme.padding * 2;

			col_widths.push(width);
		}

		// Array of fillchar strings used for borders between rows
		let borders = col_widths.map(w => theme.fillchar.repeat(w));

		// Calculate total width in characters
		let total_width = col_widths.reduce((total, width) => total + width, 0) + theme.data.middle.length * (this.width-1);
		
		// Appends a row to str using the given theme edge
		let str = '';
		function append_row(edge, row)
		{
			if (edge && row)
			{
				str += edge.left + row.join(edge.middle) + edge.right + '\n';
			}
		}

		// Top row
		append_row(
			table[0].type == 'full' ? theme.top_flat : theme.top_down,
			borders
		);

		// For each row		
		table.forEach(function(row, row_idx) {
			if (row.type == 'full')
			{
				// Full is basically a data row with one cell
				append_row(theme.data, [ align(row.data, total_width, 'c') ]);
				// If there is a next row and the current row has a div after it...
				if (row.div && table[row_idx + 1])
				{
					// Add border
					append_row(
						table[row_idx + 1].type == 'full' ? theme.middle_flat : theme.middle_down,
						borders
					);
				}
			}
			else
			{
				// Normal data row
				append_row(theme.data, row.data.map((cell, col_idx) => align(cell, col_widths[col_idx], row.align[col_idx])));
				// If there is a next row and the current row has a div after it...
				if (row.div && table[row_idx+1])
				{
					// Add border
					append_row(
						table[row_idx + 1].type == 'full' ? theme.middle_up : theme.middle_updown,
						borders
					);
				}
			}
		});

		// Bottom row
		append_row(
			table[table.length - 1].type == 'full' ? theme.bottom_flat : theme.bottom_up,
			borders
		);

		return str;
	}

	// Returns the number of rows in the table (excluding divs)
	get length()
	{
		return this.rows.length;
	}
}

Table.themes = {};

// Default theme
Table.themes.default = {
	fillchar: '─',
	data:
		{ left: '│ ', middle: ' │ ', right: ' │' },

	top_flat:
		{ left: '┌─', middle: '───', right: '─┐' },
	top_down:
		{ left: '┌─', middle: '─┬─', right: '─┐' },

	middle_flat:
		{ left: '├─', middle: '───', right: '─┤' },
	middle_up:
		{ left: '├─', middle: '─┴─', right: '─┤' },
	middle_down:
		{ left: '├─', middle: '─┬─', right: '─┤' },
	middle_updown:
		{ left: '├─', middle: '─┼─', right: '─┤' },

	bottom_up:
		{ left: '└─', middle: '─┴─', right: '─┘' },
	bottom_flat:
		{ left: '└─', middle: '───', right: '─┘' },
};

// "Borderless" theme
Table.themes.borderless = {
	fillchar: '─',
	data:
		{ left: ' ', middle: '   ', right: ' ' },

	top_flat:
		null,
	top_down:
		null,

	middle_flat:
		{ left: '─', middle: '───', right: '─' },
	middle_up:
		{ left: '─', middle: '─ ─', right: '─' },
	middle_down:
		{ left: '─', middle: '───', right: '─' },
	middle_updown:
		{ left: '─', middle: '─ ─', right: '─' },

	bottom_up:
		null,
	bottom_flat:
		null,
};


module.exports = Table;
