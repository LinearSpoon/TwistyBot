

// https://www.npmjs.com/package/columnify
// https://support.discordapp.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-
// http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Collection
var columnify = require('columnify');
var util = custom_require('util');
var save = custom_require('save');

var name_cache = load_names();
var name_dictionary = root_require('dictionary.js');

function load_names()
{
	var raw = root_require('names.json');
	var ret = [];
	for(var i in raw)
		ret.push({id: i, name: raw[i].name.toLowerCase() });
	util.save_file('names_processed.json', JSON.stringify(ret));
	return ret;
}

function get_item_id(name)
{
	name = name.toLowerCase();
	var match = name_cache.find( e => e.name == name );
	return match ? match.id : 0;
}

function get_item_summary(id)
{
	return util.download('https://api.rsbuddy.com/grandExchange?a=guidePrice&i=' + id)
		.then( body => JSON.parse(body) );
}

function get_similar_items(name)
{
	return util.fuzzy_match(name, name_cache.map(el => el.name));
}


module.exports.price = function(client, message, params)
{
	// https://rsbuddy.com/exchange/summary.json
	// https://rsbuddy.com/exchange/names.json
	// https://api.rsbuddy.com/grandExchange?a=guidePrice&i=<id>  => {"overall":222,"buying":222,"buyingQuantity":470395,"selling":221,"sellingQuantity":425068}
	// https://api.rsbuddy.com/grandExchange?a=graph&start=1425921352106&g=1440&i=<id>  => history?
	// https://api.rsbuddy.com/grandExchange?i=7944&a=graph&g=1

	var item = params.join(' ');

	var id = get_item_id(item);
	if (!id && name_dictionary[item])
	{
		item = name_dictionary[item];
		id = get_item_id(item);
	}
	if (!id)
	{ // Try fuzzy string search
		console.log(item, 'not found. Possible matches:');
		var guesses = get_similar_items(item).slice(0, 10);
		guesses = columnify(guesses, {
			showHeaders: true,
			config: {
				name: { minWidth: 24 },
				value: { align: 'right' }
			}
		});
		console.log(guesses);

		return message.channel.sendMessage('Item not found! Are you looking for one of these?\n```' + guesses + '```');
	}
	// We have a valid item ID
	console.log('Looking up', item);
	return get_item_summary(id)
		.then( function(data) {

			var columns = columnify([
				{ name: "Overall Price:", value: util.format_number(data.overall), unit:"GP" },
				{ name: "Buying Price:", value: util.format_number(data.buying), unit:"GP" },
				{ name: "Amount Bought:", value: util.format_number(data.buyingQuantity), unit:"" },
				{ name: "Selling Price:", value: util.format_number(data.selling), unit:"GP" },
				{ name: "Amount Sold:", value: util.format_number(data.sellingQuantity), unit:"" },
			], {
				showHeaders: false,
				config: {
					name: { minWidth: 18 },
					value: { align: 'right' }
				}
			});
			message.channel.sendMessage(
				'Showing details for __' + item + '__:'
				+ '```\n' + columns + '\n```'
			 	+ '__Graph:__ https://rsbuddy.com/exchange?id=' + id);
		})
		.catch( err => message.channel.sendMessage(err.message) );
}


module.exports.poll = function(client, message, params)
{

}
