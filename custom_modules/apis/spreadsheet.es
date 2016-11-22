// https://www.npmjs.com/package/google-spreadsheet
var GoogleSpreadsheet = require('google-spreadsheet');
var account_details = root_require('config/google_spreadsheet.json');

function load_auth_doc(doc_id)
{
	return new Promise(function(resolve, reject) {
		var spreadsheet = new GoogleSpreadsheet(doc_id);
		spreadsheet.useServiceAccountAuth(account_details, function(err, i) {
			if (err)
			{
				console.warn(err);
				return reject(err);
			}
			resolve(spreadsheet);
		});
	});
}

module.exports.sheet_info = async function(doc_id)
{
	var spreadsheet = await load_auth_doc(doc_id);
	return new Promise(function(resolve, reject) {
		spreadsheet.getInfo( (err, info) => err ? reject(err) : resolve(info) );
	});
};


// cell.value
// cell.numericValue
// cell.formula
module.exports.read_cells = async function(doc_id, sheet_id, xmin, xmax, ymin, ymax)
{
	var spreadsheet = await load_auth_doc(doc_id);
	return new Promise(function(resolve, reject) {
		spreadsheet.getCells(sheet_id, {
				'min-row': ymin, 'max-row': ymax,
				'min-col': xmin, 'max-col': xmax,
				'return-empty': true
			}, function(err, cells) {
				if (err)
					return reject(err);
				// Convert flat array of cells to something more useful
				var matrix = [];
				for(var i = xmin; i <= xmax; i++)
					matrix[i] = [];

				for(var k in cells)
				{
					var cell = cells[k];
					matrix[cell.col][cell.row] = {
						value: cell.value,
						numericValue: cell.numericValue,
						formula: cell.formula,
						x: cell.col,
						y: cell.row
					};
				}

				return resolve(matrix);
			});
		});
};
