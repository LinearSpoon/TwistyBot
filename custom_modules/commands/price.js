var item_groups = root_require('data/item_groups');
let Table = root_require('classes/Table');

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

	// Get price data
	let details = await apis.RSBuddy.get_details(...items);
	console.log(details);
	return items.length == 1 ? full_detail(details[0]) : multi_detail(details);


	// // Multiple items to check

};

// .name
// .searched_name
// .id
// .inactive
// .very_inactive
// .last_updated
// .suggestions
// .overall_price
// .buy_price
// .sell_price
// .amount_bought
// .amount_sold
function full_detail(item)
{
	if (!item.id)
	{
		console.log(item.suggestions);
		let guesses = item.suggestions.map(el => util.printf('%-32s %3d', el.name, el.score));
		return 'Item not found! Are you looking for one of these?\n' +
			Discord.code_block('Item                           Score\n' + guesses.join('\n'));
	}

	let command_response = 'Showing item for ' + item.name + ':\n';

	if (item.very_inactive)
	{ // Item is valid but price not found
		return command_response + 'This item was last updated over 1 week ago.'
			+ Discord.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + item.id;
	}

	if (item.inactive)
	{	// Add a little warning
		command_response +=
			Discord.bold('Warning') + ': This item is currently inactive. Here are the latest prices from ' +
			util.approximate_time(Date.now(), item.last_updated) + ' ago:\n';
	}

	let price_data =
		util.printf('%-16s %13s GP\n', 'Overall Price:', util.format_number(item.overall_price)) +
		util.printf('%-16s %13s GP\n', 'Buying Price:', util.format_number(item.buy_price)) +
		util.printf('%-16s %13s\n', 'Amount Bought:', util.format_number(item.amount_bought)) +
		util.printf('%-16s %13s GP\n', 'Selling Price:', util.format_number(item.sell_price)) +
		util.printf('%-16s %13s\n', 'Amount Sold:', util.format_number(item.amount_sold));

	return command_response
		+ Discord.code_block(price_data)
		+ Discord.underline('Graph:') + ' https://rsbuddy.com/exchange?id=' + item.id;
}

function multi_detail(details)
{
	let table = new Table();
	table.set_align('cc', 'lr');
	table.header_row = [ 'Item', 'Price' ];
	table.borders = false;
	let total_price = 0;
	let outdated = false;
	for(let item of details)
	{
		if (!item.id)
		{
			item.name = 'Invalid: ' + item.searched_name;
		}
		if (item.inactive)
		{
			item.name = '*' + item.name;
			outdated = true;
		}
		table.data_rows.push([
			item.name,
			item.overall_price ? util.format_number(item.overall_price) + ' GP' : '-'
		]);

		total_price += item.overall_price || 0;
	}

	table.data_rows.push(['',''], [
		'Total price:',
		util.format_number(total_price) + ' GP'
	]);

	return 'Showing details for an item set.' +
		(outdated ? '\nNote: Items marked with * are currently inactive.\n' : '\n') +
	 	Discord.code_block(table.to_string());
}
