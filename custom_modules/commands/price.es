var item_groups = root_require('price_data/item_groups');

module.exports = async function(message, params) {
	if (params.length == 0)
		throw Error('Usage: !price <item>\n\nExamples:\n' +
			'!price Cannonball\n' +
			'!price ags, sgs, heart\n' +
			'!price zilyana\n' +
			'!price zam hilt');

	var items = [];
	for(var i = 0; i < params.length; i++)
	{
		var group = item_groups[params[i].toLowerCase()];
		if (group)
			items = items.concat(group);
		else
			items.push(params[i]);
	}

	if (items.length == 1)
	{ // Show full detail for single item checks
		var result = await apis.RSBuddy.get_item_details(items[0]);
		return full_detail(result);
	}

	// Multiple items to check
	var command_response;
	for(var i = 0; i < items.length; i++)
	{
		try
		{
			var result = await apis.RSBuddy.get_item_details(items[i]);
			command_response += '\n' + short_detail(result);
		}
		catch(err)
		{
			command_response += '\nError: ' + err.message;
		}
		await util.sleep(400);
	}

	return 'Showing details for an item set.' + util.dm.code_block(command_response);
};

function full_detail(result)
{
	if (!result.valid)
	{
		var guesses = result.similar_items.map(el => util.printf('%-30s %3d', el.name, el.score));
		return 'Item not found! Are you looking for one of these?\n' +
			util.dm.code_block('Item                       Score\n' + guesses.join('\n'));
	}

	var command_response = 'Showing details for ' + result.name + ':\n';

	if (!result.found)
	{ // Item is valid but price not found
		return command_response + 'This item was last updated over 1 week ago.'
			+ util.dm.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + result.id;
	}

	if (result.inactive)
	{	// Add a little warning
		command_response +=
			util.dm.bold('Warning') + ': This item is currently inactive. Here are the latest prices from ' +
			util.approximate_time(Date.now(), result.time) + ' ago:\n';
	}

	var details = result.details;
	var price_data =
		util.printf('%-16s %13s GP\n', 'Overall Price:', util.format_number(details.overallPrice || 0)) +
		util.printf('%-16s %13s GP\n', 'Buying Price:', util.format_number(details.buyingPrice || 0)) +
		util.printf('%-16s %13s\n', 'Amount Bought:', util.format_number(details.buyingCompleted || 0)) +
		util.printf('%-16s %13s GP\n', 'Selling Price:', util.format_number(details.sellingPrice || 0)) +
		util.printf('%-16s %13s\n', 'Amount Sold:', util.format_number(details.sellingCompleted || 0));

	return command_response
		+ util.dm.code_block(price_data)
		+ util.dm.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + result.id;
}

function short_detail(result)
{
	if (!result.valid)
		return 'Item name is invalid: ' + result.name;
	if (!result.found)
		return 'Price data not found: ' + result.name;

	return util.printf('%-28s %13s GP', result.name, util.format_number(result.details.overallPrice || 0));
}
