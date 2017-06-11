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
 * New command: !pickone
 * !sandwich may be more reliable
 * TwistyBot will more reliably respond as a DM if it didn't have permissions in the original channel.
 * Some !update error messages are more clear
 * !split now allows comma separators in the amount
 * Updated !price with the new items from TzHaar/Inferno update
 * Added !price ancestral
 * Added !price dks and !price zulrah
 * Added !ttmiron and !ehpiron
`;

module.exports.command = async function(message, params) {
	return Discord.code_block(changes);
};
