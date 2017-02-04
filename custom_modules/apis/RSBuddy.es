// RSB endpoints:
// https://rsbuddy.com/exchange/summary.json
// https://api.rsbuddy.com/grandExchange?a=guidePrice&i=<id>  => {"overall":222,"buying":222,"buyingQuantity":470395,"selling":221,"sellingQuantity":425068}
// https://api.rsbuddy.com/grandExchange?a=graph&start=1425921352106&g=1440&i=<id>  => history?
// https://api.rsbuddy.com/grandExchange?i=20997&a=graph&g=1

var name_dictionary = root_require('price_data/dictionary.js');	// Dictionary of alternate item names (key=alt name, value=real name)
var names_raw = root_require('price_data/names.json');		// cached from: https://rsbuddy.com/exchange/names.json

// Transform raw names into an array
var name_cache = [];
for(var i in names_raw)
{
	name_cache.push( {
		id: i,
		name: names_raw[i].name,
	 	search_name: names_raw[i].name.toLowerCase(),
	});
}
names_raw = undefined; // delete names_raw throws a warning..whatever no need to keep it around

// Returns full item name based on an abbreviation or name with incorrect case
function get_item_proper_name(name)
{
	var search_name = name.toLowerCase();
	var match = name_cache.find( e => e.search_name == search_name );
	if (match)
		return match.name;

	// Dictionary search last to give priority to the real item name
	if (name_dictionary[search_name])
		return name_dictionary[search_name];

	return '';
}

function get_item_id(name)
{
	name = get_item_proper_name(name);
	// console.log('proper name = ', name);
	var match = name_cache.find( e => e.name == name );
	return match ? match.id : 0;
};

async function get_item_summary(id)
{
	// {"overall":207,"buying":207,"buyingQuantity":477196,"selling":207,"sellingQuantity":502450}
	var url = 'https://api.rsbuddy.com/grandExchange?a=guidePrice&i=' + id;
	var res = await util.queue_request(url, { max_attempts: 10, success_delay: 400, failure_delay: 2000 });
	var body = JSON.parse(res.body);

	// Match the format of history api
	return {
		overallPrice: body.overall,
		buyingPrice: body.buying,
		sellingPrice: body.selling,
		buyingCompleted: body.buyingQuantity,
		sellingCompleted: body.sellingQuantity
	};
};

function get_similar_items(name)
{
	return util.fuzzy_match(name, name_cache.map(el => el.name)).slice(0, 10);
};

async function get_item_history(id, start, interval)
{
	// https://api.rsbuddy.com/grandExchange?a=graph&start=<timestamp>&g=<hours between datapoints>&i=<id>
	// [{"ts":1481923200000,"buyingPrice":211,"buyingCompleted":407766,"sellingPrice":212,"sellingCompleted":475813,"overallPrice":212,"overallCompleted":883579}, ...]
	var url = 'https://api.rsbuddy.com/grandExchange?a=graph&i=' + id;
	if (start)
		url += '&start=' + start;
	if (interval)
		url += '&g=' + interval;
	var res = await util.queue_request(url, { max_attempts: 10, success_delay: 400, failure_delay: 2000 });
	return JSON.parse(res.body);
};

// valid => name is linked to an actual item
// found => details contains price data
// inactive => is the price old?
async function get_item_details(name)
{
	var proper_name = get_item_proper_name(name);
	var match = name_cache.find( e => e.name == proper_name );
	// if exact match is not found, return a list of similar items
	if (!match)
	{
		return {
			name: name,
			valid: false,
			found: false,
			similar_items: get_similar_items(name)
		};
	}

	var id = match.id;
	var details = await get_item_summary(id);
	if (details.overallPrice == 0 && details.buyingPrice == 0 && details.sellingPrice == 0)
	{ // Price is inactive, get the latest price from history API
		var history = await get_item_history(id);
		if (history.length == 0)
		{	// History lookup failed
			return {
				name: proper_name,
				id: id,
				valid: true,
				found: false,
				inactive: true,
			};
		}
		// History already sorted oldest to newest
		details = history[history.length - 1];

		return {
			name: proper_name,
			id: id,
			valid: true,
			found: true,
			inactive: true,
			details: details,
			time: details.ts,
		};
	}

	return {
		name: proper_name,
		id: id,
		valid: true,
		found: true,
		inactive: false,
		details: details,
	};
};

// Export everything useful
module.exports.get_item_proper_name = get_item_proper_name;
module.exports.get_item_id = get_item_id;
module.exports.get_item_summary = get_item_summary;
module.exports.get_similar_items = get_similar_items;
module.exports.get_item_history = get_item_history;
module.exports.get_item_details = get_item_details;
