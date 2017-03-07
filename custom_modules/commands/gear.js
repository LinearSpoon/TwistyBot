module.exports.help = {
	name: 'gear',
	text: 'Calculator for accuracy/max hit/dps.',
	category: 'RuneScape'
}
module.exports.params = {
	min: 1,
	max: 99,
	help:
`Usage: !gear equip, <item1>, <item2>, ...

Examples:
!gear equip, rune full helm
!gear equip, armadyl godsword`
};
module.exports.permissions = [
	{ user: '*' }
];


var Player = custom_require('combat_calculator/player');
module.exports.command = async function(client, message, params) {
	var warnings = '';
	var p = new Player();
	for(var i = 1; i < params.length; i++)
	{
		if (!params[i])
			continue; // Ignore blank params
		var item = await apis.Spoon.get_item_stats(params[i]);
		if (item == null)
		{
			warnings += params[i] + ' not found!\n';
			continue;
		}
		p.equip(item);
	}




/*
	item = p.bonuses;
	return warnings + '\n' +
		Discord.bold('Attack bonus') +
		'\n  Stab: '  + (item.attack.stab  >= 0 ? '+' : '') + item.attack.stab +
		'\n  Slash: ' + (item.attack.slash >= 0 ? '+' : '') + item.attack.slash +
		'\n  Crush: ' + (item.attack.crush >= 0 ? '+' : '') + item.attack.crush +
		'\n  Magic: ' + (item.attack.magic >= 0 ? '+' : '') + item.attack.magic +
		'\n  Range: ' + (item.attack.range >= 0 ? '+' : '') + item.attack.range +
		Discord.bold('\nDefence bonus') +
		'\n  Stab: '  + (item.attack.stab  >= 0 ? '+' : '') + item.defence.stab +
		'\n  Slash: ' + (item.attack.slash >= 0 ? '+' : '') + item.defence.slash +
		'\n  Crush: ' + (item.attack.crush >= 0 ? '+' : '') + item.defence.crush +
		'\n  Magic: ' + (item.attack.magic >= 0 ? '+' : '') + item.defence.magic +
		'\n  Range: ' + (item.attack.range >= 0 ? '+' : '') + item.defence.range +
		Discord.bold('\nOther bonuses') +
		'\n  Melee strength: ' + (item.strength.melee >= 0 ? '+' : '') + item.strength.melee +
		'\n  Ranged strength: ' + (item.strength.range >= 0 ? '+' : '') + item.strength.range +
		'\n  Magic damage: ' + (item.strength.magic >= 0 ? '+' : '') + item.strength.magic + '%' +
		'\n  Prayer: ' + (item.prayer >= 0 ? '+' : '') + item.prayer +
		(item.speed > 0 ? '\n  Speed: ' + item.speed + ' (' + (6 - item.speed * 0.6).toFixed(1) + ' seconds)' : '');
*/
	return Discord.code_block(get_embed(p));
};


var Table = require('cli-table2');
function get_embed(player)
{

	var table = new Table({style:{head:[],border:[]}});

	var gear = player.gear;

	var chars = { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '│' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
         , 'right': '│' , 'right-mid': '' , 'middle': '|' };
	table.push(
		[{ hAlign: 'center', colSpan: 2, content: 'Gear' }],
		[ 'Weapon', { hAlign: 'right', content: gear.weapon ? gear.weapon.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.shield ? gear.shield.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.head ? gear.head.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.body ? gear.body.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.leg ? gear.leg.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.boots ? gear.boots.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.hand ? gear.hand.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.cape ? gear.cape.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.ring ? gear.ring.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.neck ? gear.neck.name : '' }],
		[{ chars, content: 'Weapon' }, { chars, hAlign: 'right', content: gear.ammo ? gear.ammo.name : '' }]
	);

	return table.toString();

	for(var i in player.gear)
		gear += i + ': ' + (player.gear[i] ? player.gear[i].name : '-') + '\n';

	for(var i in player.levels)
		levels += i + ': ' + player.boosted_levels[i] + '/' + player.levels[i] + '\n';

	e.addField('Gear:', Discord.code_block(gear), false);
	e.addField('Levels:', levels, true);


	e.addField('Attack bonus',
		'Stab: '  + (player.bonuses.attack.stab  >= 0 ? '+' : '') + player.bonuses.attack.stab +
		'\nSlash: ' + (player.bonuses.attack.slash >= 0 ? '+' : '') + player.bonuses.attack.slash +
		'\nCrush: ' + (player.bonuses.attack.crush >= 0 ? '+' : '') + player.bonuses.attack.crush +
		'\nMagic: ' + (player.bonuses.attack.magic >= 0 ? '+' : '') + player.bonuses.attack.magic +
		'\nRange: ' + (player.bonuses.attack.range >= 0 ? '+' : '') + player.bonuses.attack.range,true);
	e.addField('Defence bonus',
		'Stab: '  + (player.bonuses.defence.stab  >= 0 ? '+' : '') + player.bonuses.defence.stab +
		'\nSlash: ' + (player.bonuses.defence.slash >= 0 ? '+' : '') + player.bonuses.defence.slash +
		'\nCrush: ' + (player.bonuses.defence.crush >= 0 ? '+' : '') + player.bonuses.defence.crush +
		'\nMagic: ' + (player.bonuses.defence.magic >= 0 ? '+' : '') + player.bonuses.defence.magic +
		'\nRange: ' + (player.bonuses.defence.range >= 0 ? '+' : '') + player.bonuses.defence.range,true);
	e.addField('Other bonuses',
		'Melee strength: ' + (player.bonuses.strength.melee >= 0 ? '+' : '') + player.bonuses.strength.melee +
		'\nRanged strength: ' + (player.bonuses.strength.range >= 0 ? '+' : '') + player.bonuses.strength.range +
		'\nMagic damage: ' + (player.bonuses.strength.magic >= 0 ? '+' : '') + player.bonuses.strength.magic + '%' +
		'\nPrayer: ' + (player.bonuses.prayer >= 0 ? '+' : '') + player.bonuses.prayer +
		'\nSpeed: ' + player.bonuses.speed + ' (' + (6 - player.bonuses.speed * 0.6).toFixed(1) + ' seconds)');

	return e;
}
