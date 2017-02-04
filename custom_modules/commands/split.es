module.exports.help = {
	name: 'split',
	text: 'Calculates split amounts.',
	category: 'RuneScape'
};
module.exports.params = {
	min: 2,
	max: 2,
	help:
`Usage: !split <amount>, <num_players>

Examples:'
!split 3000000, 2
!split 40.2m, 3
!split 26231k, 2`
};
module.exports.whitelist = null;

module.exports.command = async function(client, message, params) {
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
	return Discord.code_block(split);
};
