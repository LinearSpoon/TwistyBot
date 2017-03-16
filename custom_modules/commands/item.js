module.exports.help = {
	name: 'item',
	text: 'Retrieve item stats.',
	category: 'RuneScape'
}
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !item <item_name>

Examples:
!item rune full helm
!item armadyl godsword`
};
module.exports.permissions = [
	{ user: '*' }
];

module.exports.command = async function(message, params) {
	var item = await apis.Spoon.get_item_stats(params[0]);
	if (item == null)
		return Discord.code_block('Item not found!');

	return Discord.bold('Attack bonus') +
		'\n  Stab: '  + (item.attack.stab  >= 0 ? '+' : '') + item.attack.stab +
		'\n  Slash: ' + (item.attack.slash >= 0 ? '+' : '') + item.attack.slash +
		'\n  Crush: ' + (item.attack.crush >= 0 ? '+' : '') + item.attack.crush +
		'\n  Magic: ' + (item.attack.magic >= 0 ? '+' : '') + item.attack.magic +
		'\n  Range: ' + (item.attack.range >= 0 ? '+' : '') + item.attack.range +
		Discord.bold('\nDefence bonus') +
		'\n  Stab: '  + (item.defence.stab  >= 0 ? '+' : '') + item.defence.stab +
		'\n  Slash: ' + (item.defence.slash >= 0 ? '+' : '') + item.defence.slash +
		'\n  Crush: ' + (item.defence.crush >= 0 ? '+' : '') + item.defence.crush +
		'\n  Magic: ' + (item.defence.magic >= 0 ? '+' : '') + item.defence.magic +
		'\n  Range: ' + (item.defence.range >= 0 ? '+' : '') + item.defence.range +
		Discord.bold('\nOther bonuses') +
		'\n  Melee strength: ' + (item.strength.melee >= 0 ? '+' : '') + item.strength.melee +
		'\n  Ranged strength: ' + (item.strength.range >= 0 ? '+' : '') + item.strength.range +
		'\n  Magic damage: ' + (item.strength.magic >= 0 ? '+' : '') + item.strength.magic + '%' +
		'\n  Prayer: ' + (item.prayer >= 0 ? '+' : '') + item.prayer +
		(item.speed > 0 ? '\n  Speed: ' + item.speed + ' (' + (6 - item.speed * 0.6).toFixed(1) + ' seconds)' : '');
};
