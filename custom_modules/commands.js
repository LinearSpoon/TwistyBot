// https://www.npmjs.com/package/columnify
// https://support.discordapp.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-
var columnify = require('columnify');
var cloudscraper = require('cloudscraper');
var name_cache = load_names();


function download(url)
{
	return new Promise(function(resolve, reject) {
		var g = cloudscraper.get(url, function(error, response, body) {
			if (error)
				return reject(error);
			return resolve(body);
		});
	});
}

function load_names()
{
	var name_cache = root_require('names.json');
	for(var i in name_cache)
		name_cache[i].name = name_cache[i].name.toLowerCase();
	return name_cache;
}

function get_item_id(name)
{
	name = name.toLowerCase();
	for(var i in name_cache)
	{
		if (name_cache[i].name == name)
			return i;
	}
}

function get_item_summary(id)
{
	return download('https://api.rsbuddy.com/grandExchange?a=guidePrice&i=' + id)
		.then( body => JSON.parse(body) );

}



module.exports.price = function(client, message, params)
{
	// https://rsbuddy.com/exchange/summary.json
	// https://rsbuddy.com/exchange/names.json
	// https://api.rsbuddy.com/grandExchange?a=guidePrice&i=<id>  => {"overall":222,"buying":222,"buyingQuantity":470395,"selling":221,"sellingQuantity":425068}
	// https://api.rsbuddy.com/grandExchange?a=graph&start=1425921352106&g=1440&i=<id>  => history?
	// https://api.rsbuddy.com/grandExchange?i=7944&a=graph&g=1

	var item = params.join(' ');
	console.log('Looking up', item);
	var id = get_item_id(item);
	if (!id)
		return message.reply('Item not found!');

	return get_item_summary(id)
		.then( function(data) {

			var columns = columnify([
				{ name: "Overall Price:", value: data.overall, unit:"GP" },
				{ name: "Buying Price:", value: data.buying, unit:"GP" },
				{ name: "Amount Bought:", value: data.buyingQuantity, unit:"" },
				{ name: "Selling Price:", value: data.selling, unit:"GP" },
				{ name: "Amount Sold:", value: data.sellingQuantity, unit:"" },
			], {
				showHeaders: false,
				config: {
					name: { minWidth: 18 },
					value: { align: 'right' }
				}
			});
			message.channel.sendMessage('```\n' + columns + '\n```' +
				'__Graph:__ https://rsbuddy.com/exchange?id=' + id);
		})
		.catch( err => message.channel.sendMessage(err.message) );


	//return load_name_cache()
	//	.catch( err => console.log(err) );
}
