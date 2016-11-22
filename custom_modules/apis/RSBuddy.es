// RSB endpoints:
// https://rsbuddy.com/exchange/summary.json
// https://api.rsbuddy.com/grandExchange?a=guidePrice&i=<id>  => {"overall":222,"buying":222,"buyingQuantity":470395,"selling":221,"sellingQuantity":425068}
// https://api.rsbuddy.com/grandExchange?a=graph&start=1425921352106&g=1440&i=<id>  => history?
// https://api.rsbuddy.com/grandExchange?i=7944&a=graph&g=1

var name_dictionary = root_require('dictionary.js');	// Dictionary of alternate item names (key=alt name, value=real name)
var names_raw = root_require('names.json');		// cached from: https://rsbuddy.com/exchange/names.json

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
module.exports.get_item_proper_name = function(name)
{
	var search_name = name.toLowerCase();
	var match = name_cache.find( e => e.search_name == search_name );
	if (match)
		return match.name;

	// Dictionary search last to give priority to the real item name
	if (name_dictionary[search_name])
		return name_dictionary[search_name];

	return '';
};

module.exports.get_item_id = function(name)
{
	name = module.exports.get_item_proper_name(name);
	// console.log('proper name = ', name);
	var match = name_cache.find( e => e.name == name );
	return match ? match.id : 0;
};

module.exports.get_item_summary = async function(id)
{
	// {"overall":207,"buying":207,"buyingQuantity":477196,"selling":207,"sellingQuantity":502450}
	var body = await util.download('https://api.rsbuddy.com/grandExchange?a=guidePrice&i=' + id);
	return JSON.parse(body);
};

module.exports.get_similar_items = function(name)
{
	return util.fuzzy_match(name, name_cache.map(el => el.name));
};
