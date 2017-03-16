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
module.exports.command = async function(message, params) {
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


	return [
		Discord.code_block(
			gear_table(p, new Player()) + '\n' +
			levels_table(p, new Player())
		),
		Discord.code_block(
			bonuses_table(p, new Player())
		)
	];
};






var Table = require('cli-table2');


function gear_table(player1, player2)
{
	var table = new Table({colWidths: [12, 20, 20], style:{head:[],border:[]}});

	table.push([ // Header
		Table.cell('Gear', 'center'),
		Table.cell('You', 'center'),
		Table.cell('Opponent', 'center'),
	]);

	var rows = {
		weapon: 'Weapon',
		shield: 'Shield',
		head: 'Head',
		body: 'Body',
		leg: 'Legs',
		boots: 'Boots',
		hand: 'Gloves',
		cape: 'Cape',
		ring: 'Ring',
		neck: 'Neck',
		ammo: 'Ammo'
	};

	push_rows( table, Object.keys(rows).map( function(e) {
		return [
			rows[e],
			player1.gear[e] ? player1.gear[e].name : '.',
			player2.gear[e] ? player2.gear[e].name : '.'
		];
	}));

	return table.toString();
}

function levels_table(player1, player2)
{
	var table = new Table({colWidths: [12, 15, 15], style:{head:[],border:[]}});

	table.push([ // Header
		Table.cell('Levels', 'center'),
		Table.cell('You', 'center'),
		Table.cell('Opponent', 'center'),
	]);

	var rows = {
		hp: 'Hitpoints',
		attack: 'Attack',
		strength: 'Strength',
		defence: 'Defence',
		magic: 'Magic',
		range: 'Range',
		prayer: 'Prayer',
	};

	push_rows( table, Object.keys(rows).map( function(e) {
		return [
			rows[e],
			player1.boosted_levels[e] + '/' + player1.levels[e],
			player2.boosted_levels[e] + '/' + player2.levels[e]
		];
	}));

	return table.toString();
}

function bonuses_table(player1, player2)
{
	// Add a '+' in front of numbers >= zero
	var fmt = n => n >= 0 ? '+' + n : n;

	var table = new Table({colWidths: [18, 12, 12], style:{head:[],border:[]}});

	table.push(
		[ // Header
			Table.cell('Bonuses', 'center'),
			Table.cell('You', 'center'),
			Table.cell('Opponent', 'center'),
		]
	);

	table.push(
		[
			Table.cell('Attack', 'center'),
			Table.cell(),
			Table.cell(),
		]
	);

	Array.prototype.push.apply(table, Object.keys(player1.bonuses.attack).map( r => [
		Table.cell(r[0].toUpperCase() + r.substr(1), 'no-top'),
		Table.cell(fmt(player1.bonuses.attack[r]), 'no-top right'),
		Table.cell(fmt(player2.bonuses.attack[r]), 'no-top right'),
	]));

	table.push(
		[ // Header
			Table.cell('Defence', 'center no-top'),
			Table.cell('', 'no-top'),
			Table.cell('', 'no-top'),
		]
	);

	Array.prototype.push.apply(table, Object.keys(player1.bonuses.defence).map( r => [
		Table.cell(r[0].toUpperCase() + r.substr(1), 'no-top'),
		Table.cell(fmt(player1.bonuses.defence[r]), 'no-top right'),
		Table.cell(fmt(player2.bonuses.defence[r]), 'no-top right'),
	]));



	table.push(
		[ // Header
			Table.cell('Other', 'center no-top'),
			Table.cell('', 'no-top'),
			Table.cell('', 'no-top'),
		]
	);

	Array.prototype.push.apply(table, [
		[ 'Melee strength', fmt(player1.bonuses.strength.melee), fmt(player2.bonuses.strength.melee) ],
		[ 'Range strength', fmt(player1.bonuses.strength.range), fmt(player2.bonuses.strength.range) ],
		[ 'Magic damage', fmt(player1.bonuses.strength.magic) + '%', fmt(player2.bonuses.strength.magic) + '%' ],
		[ 'Prayer', fmt(player1.bonuses.prayer), fmt(player2.bonuses.prayer) ],
		[ 'Attack Speed', player1.bonuses.speed_seconds.toFixed(1) + 's', player2.bonuses.speed_seconds.toFixed(1) + 's' ],
	].map( r => [ Table.cell(r[0], 'no-top'), Table.cell(r[1], 'no-top right'), Table.cell(r[2], 'no-top right') ]));

	return table.toString();
}

function push_rows(table, rows)
{
	// Do first row manually to preserve top border
	table.push([
		Table.cell(rows[0][0]),
		Table.cell(rows[0][1], 'right'),
		Table.cell(rows[0][2], 'right')
	]);

	for(var i = 1; i < rows.length; i++)
	{
		table.push([
			Table.cell(rows[i][0], 'no-top'),
			Table.cell(rows[i][1], 'right no-top'),
			Table.cell(rows[i][2], 'right no-top')
		]);
	}
}
