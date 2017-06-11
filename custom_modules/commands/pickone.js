module.exports.help = {
	name: 'pickone',
	text: 'Picks a random choice from a list of possible choices.',
	category: 'General'
};
module.exports.params = {
	min: 1,
	max: 200,
	help:
`Usage: !pickone <choice1>, <choice2>, ...

Examples:
!pickone a, b, c
!pickone bandos, armadyl, saradomin, zamorak, corp`
};
module.exports.permissions = [
	{ user: '*' }
];


module.exports.command = async function(message, params) {
	params = params.filter(p => p.length > 1);
	return params[Math.floor(Math.random() * params.length)];
};
