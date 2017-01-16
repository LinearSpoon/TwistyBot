module.exports = async function(client, message, params) {
	if (params.length != 2)
	{
		throw Error('Usage: !split <amount>, <players>\n\nExamples:'
			+ '\n!split 3000000, 2'
			+ '\n!split 40m, 3'
			+ '\n!split 26231k, 2');
	}
	var str_amount = params[0].toLowerCase();
	// Extract number without any extra stuff
	var amount = +str_amount.replace(/[^0-9.]/g,'');
	// Check for common suffixes
	if (str_amount.indexOf('k') > -1)
		amount *= 1000;
	if (str_amount.indexOf('m') > -1)
		amount *= 1000000;
	if (str_amount.indexOf('b') > -1)
		amount *= 1000000000;

	var split = amount / +params[1];
	// Make a pretty number
	if (split > 100000000) // 100m
		split = util.format_number(split / 1000000) + 'm'
	else if (split > 1000000) // 1m
		split = util.format_number(Math.floor(split / 1000)) + 'k';
	else
		split = util.format_number(Math.floor(split));
	return util.dm.code_block(split);
};
