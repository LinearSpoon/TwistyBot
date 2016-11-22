module.exports = async function(params) {
	if (params.length != 1)
		throw Error('Usage: !price <item>\n\nExamples:\n!price Cannonball\n!price ags\n!price zam hilt');

	var item = params[0];

	var id = apis.RSBuddy.get_item_id(item);
	if (!id)
	{ // Try fuzzy string search
		var guesses = apis.RSBuddy.get_similar_items(item).slice(0, 10).map(el => [el.name, el.score]);
		return 'Item not found! Are you looking for one of these?' +
			util.dm.table(guesses, [24], [], ['Item', 'Score']);
	}

	// We have a valid item ID
	console.log('Looking up', item);
	var details = await apis.RSBuddy.get_item_summary(id);
	var table_data = [
		['Overall Price:', util.format_number(details.overall), 'GP'],
		['Buying Price:', util.format_number(details.buying), 'GP'],
		['Amount Bought:', util.format_number(details.buyingQuantity), ''],
		['Amount Bought:', util.format_number(details.selling), 'GP'],
		['Amount Sold:', util.format_number(details.sellingQuantity), '']
	];

	return 'Showing details for ' + apis.RSBuddy.get_item_proper_name(item) + ':'
		+ util.dm.table(table_data, [18], ['left', 'right'])
		+ util.dm.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + id;
};
