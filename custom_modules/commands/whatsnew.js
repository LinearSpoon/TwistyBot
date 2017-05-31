module.exports.help = {
	name: 'whatsnew',
	text: 'View recent TwistyBot changes.',
	category: 'General'
};
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !whatsnew`
};
module.exports.permissions = [
	{ user: '*' }
];

const changes = `Changelog:
 * Added !price ancestral
 * Added !price dks and !price zulrah
 * Added !ttmiron and !ehpiron
`;

module.exports.command = async function(message, params) {
	return Discord.code_block(changes);
};
