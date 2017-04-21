var item_groups = root_require('data/item_groups');

module.exports.help = {
	name: 'price',
	text: 'Retrieves price of items from RSBuddy.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 1,
	max: 20,
	help:
`Usage: !price <item>

Examples:
!price Cannonball
!price ags, sgs, heart
!price zilyana
!price zam hilt`
};
module.exports.permissions = [
	{ user: '*' }
];


module.exports.command = async function(message, params) {
	var items = [];
	for(var i = 0; i < params.length; i++)
	{
		if (params[i] == '')
			continue
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
	var command_response = '', total_price = 0;
	var inactive_note = false;
	for(var i = 0; i < items.length; i++)
	{
		try
		{
			var result = await apis.RSBuddy.get_item_details(items[i]);
			command_response += '\n' + short_detail(result);
			if (result.found)
				total_price += result.details.overallPrice;
			if (result.inactive)
				inactive_note = true;
		}
		catch(err)
		{
			command_response += '\nError: ' + err.message;
		}
	}

	return 'Showing details for an item set.' +
		(inactive_note ? '\nNote: Items marked with * are currently inactive.\n' : '\n') +
		Discord.code_block(command_response +
		util.printf('\n\n%-28s %13s GP', 'Total price:', util.format_number(total_price)));
};

function full_detail(result)
{
	if (!result.valid)
	{
		var guesses = result.similar_items.map(el => util.printf('%-32s %3d', el.name, el.score));
		return 'Item not found! Are you looking for one of these?\n' +
			Discord.code_block('Item                           Score\n' + guesses.join('\n'));
	}

	var command_response = 'Showing details for ' + result.name + ':\n';

	if (!result.found)
	{ // Item is valid but price not found
		return command_response + 'This item was last updated over 1 week ago.'
			+ Discord.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + result.id;
	}

	if (result.inactive)
	{	// Add a little warning
		command_response +=
			Discord.bold('Warning') + ': This item is currently inactive. Here are the latest prices from ' +
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
		+ Discord.code_block(price_data)
		+ Discord.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + result.id;
}

function short_detail(result)
{
	if (!result.valid)
		return 'Item name is invalid: ' + result.name;
	if (!result.found)
		return 'Price data not found: ' + result.name;
	var name = result.name;
	if (result.inactive)
		name = '*' + name;
	return util.printf('%-28s %13s GP', name, util.format_number(result.details.overallPrice || 0));
}
