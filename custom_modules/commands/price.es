module.exports = async function(params) {
	if (params.length != 1)
		throw Error('Usage: !price <item>\n\nExamples:\n!price Cannonball\n!price ags\n!price zam hilt');

	var item = params[0];

	var id = apis.RSBuddy.get_item_id(item);
	if (!id)
	{ // Try fuzzy string search
		var guesses = apis.RSBuddy.get_similar_items(item).slice(0, 10).map(el => util.printf('%-25s %3d', el.name, el.score));
		return 'Item not found! Are you looking for one of these?\n' +
			util.dm.code_block('Item                    Score\n' + guesses.join('\n'));
	}

	// We have a valid item ID
	console.log('Looking up', item);
	var details = await apis.RSBuddy.get_item_summary(id);
	var price_data =
		util.printf('%-14s %13s GP\n', 'Overall Price:', util.format_number(details.overall)) +
		util.printf('%-14s %13s GP\n', 'Buying Price:', util.format_number(details.buying)) +
		util.printf('%-14s %13s\n', 'Amount Bought:', util.format_number(details.buyingQuantity)) +
		util.printf('%-14s %13s GP\n', 'Selling Price:', util.format_number(details.overall)) +
		util.printf('%-14s %13s\n', 'Amount Sold:', util.format_number(details.sellingQuantity));

	return 'Showing details for ' + apis.RSBuddy.get_item_proper_name(item) + ':'
		+ util.dm.code_block(price_data)
		+ util.dm.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + id;
};
