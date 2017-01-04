module.exports = async function(message, params) {
	if (params.length != 1)
		throw Error('Usage: !price <item>\n\nExamples:\n!price Cannonball\n!price ags\n!price zam hilt');

	var item = params[0];

	var id = apis.RSBuddy.get_item_id(item);
	if (!id)
	{ // Try fuzzy string search
		var guesses = apis.RSBuddy.get_similar_items(item).slice(0, 10).map(el => util.printf('%-28s %3d', el.name, el.score));
		return 'Item not found! Are you looking for one of these?\n' +
			util.dm.code_block('Item                       Score\n' + guesses.join('\n'));
	}

	// We have a valid item ID
	var command_response = 'Showing details for ' + apis.RSBuddy.get_item_proper_name(item) + ':\n';
	var details = await apis.RSBuddy.get_item_summary(id);
	// Check if item is inactive
	if (details.overallPrice == 0 && details.buyingPrice == 0 && details.sellingPrice == 0)
	{ // Try using the history api
		var history = await apis.RSBuddy.get_item_history(id);
		if (history.length == 0)
		{
			// History lookup failed
			return command_response + 'This item was last updated over 1 week ago.'
				+ util.dm.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + id;
		}
		// History already sorted oldest to newest
		details = history[history.length - 1];

		// Add a little warning
		command_response +=
			util.dm.bold('Warning') + ': This item is currently inactive. Here are the latest prices from ' +
			util.approximate_time(Date.now() - details.ts) + ' ago:\n';
	}

	var price_data =
		util.printf('%-14s %13s GP\n', 'Overall Price:', util.format_number(details.overallPrice || 0)) +
		util.printf('%-14s %13s GP\n', 'Buying Price:', util.format_number(details.buyingPrice || 0)) +
		util.printf('%-14s %13s\n', 'Amount Bought:', util.format_number(details.buyingCompleted || 0)) +
		util.printf('%-14s %13s GP\n', 'Selling Price:', util.format_number(details.sellingPrice || 0)) +
		util.printf('%-14s %13s\n', 'Amount Sold:', util.format_number(details.sellingCompleted || 0));

	return command_response
		+ util.dm.code_block(price_data)
		+ util.dm.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + id;
};
