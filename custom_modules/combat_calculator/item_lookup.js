var items = require(__dirname + '/items.js');

module.exports = function(item_name)
{
	item_name = item_name.toLowerCase();
	return items.find(function(item) {
		if (item.name.toLowerCase() == item_name)
			return true;
		// Let's pretend alt_names is already lowercase
		return item.alt_names.indexOf(item_name) > -1;
	});
};
