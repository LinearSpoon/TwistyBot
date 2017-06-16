/*
  Below code is taken from https://crystalmathlabs.com/tracker/suppliescalc.php
*/
module.exports.rates = [	0, // Overall
	[0,15000,	37224,38000,	100000,55000,	1000000,65000,	1986068,82000,	3000000,95000,	5346332,115000,	13034431,160000], // Attack
	[0,350000], // Defence
	[0,15000,	37224,38000,	100000,55000,	1000000,65000,	1986068,82000,	3000000,95000,	5346332,115000,	13034431,160000], // Strength
	0, // Hitpoints
	[0,250000,	6517253,330000,	13034431,900000], // Ranged
	[0,625000], // Prayer
	[0,250000], // Magic
	[0,40000,	7842,130000,	37224,175000,	737627,490000], // Cooking
	[0,7000,	2411,16000,	13363,35000,	41171,49000,	302288,100000,	737627,129000,	1986068,141000,	5902831,153000,	13034431,165000], // Woodcutting
	[0,30000,	969,45000,	33648,150000,	50339,250000,	150872,500000,	302288,700000,	13034431,850000], // Fletching
	[0,14000,	4470,30000,	13363,40000,	273742,65000,	737627,75000,	2421087,88000,	5902831,90000,	10692629,100000,	13034431,108000], // Fishing
	[0,45000,	13363,132750,	61512,199125,	273742,298687,	1210421,448105,	5346332,516250], // Firemaking
	[0,57000,	300000,170000,	362000,285000,	496254,336875,	2951373,425000], // Crafting
	[0,40000,	37224,350000], // Smithing
	[0,8000,	14833,20000,	41171,44000,	302288,60000,	547953,75000,	1986068,90000,	5902831,105000,	13034431,120000], // Mining
	[0,60000,	27473,200000,	2192818,425000], // Herblore
	[0,6000,	13363,15000,	41171,44000,	449428,50000,	2192818,55000,	6000000,59000,	11000000,70000], // Agility
	[0,15000,	61512,60000,	166636,100000,	449428,220000,	5902831,255000,	13034431,270000], // Thieving
	[0,5000,	37224,12000,	100000,17000,	1000000,25000,	1986068,50000,	3000000,55000,	7195629,60000,	13034431,75000], // Slayer
	[0,10000,	2411,50000,	13363,80000,	61512,150000,	273742,350000,	1210421,2000000], // Farming
	[0,8000,	2107,20000,	101333,45000,	1210421,68500], // Runecrafting
	[0,5000,	12031,40000,	247886,80000,	1986068,115000,	3972294,135000,	6517253,150000,	13034431,185000], // Hunter
	[0,20000,	18247,100000,	123660,875000] // Construction
];

module.exports.prepare = function prepare(tc) {
	var xp = tc.xp;
	var target_xp = tc.target_xp;

	// mining and agility from rc
	//tc.target_xp_mod[15] = Math.min(target_xp, target_xp - ((Math.min(40000000, target_xp) - Math.max(5902831, xp[21])) * 0.026));
	//tc.target_xp_mod[17] = tc.target_xp_mod[15];

	// fm from wc
	tc.target_xp_mod[12] = Math.min(target_xp, target_xp - ((target_xp - Math.max(302288, xp[9])) * 0.2009));

	// smithing from mining
	tc.target_xp_mod[14] = Math.min(target_xp, target_xp - ((target_xp - Math.max(302288, xp[15])) * 0.08));

	if(xp[11] < target_xp) { // fishing
		xp[17] += (target_xp - Math.max(83014, xp[11])) / 11.3; // agil from fish
		xp[3] += (target_xp - Math.max(83014, xp[11])) / 11.3; // strength from fish
	}

	//if(xp[14] < target_xp) { // smithing
	//	xp[7] += (Math.min(4385776, target_xp) - Math.min(4385776, xp[14])) * 53.0 / 56.2; // magic from smithing
	//}

	if(xp[9] < target_xp) { // woodcutting
		xp[10] += (target_xp - xp[9]) * 1.0; // fletching from woodcutting
		xp[7] += (target_xp - xp[9]) * 0.15; // magic from woodcutting
	}

	if(xp[17] < tc.target(17)) { // agility
		xp[10] += (tc.target(17) - xp[17]) * 0.5; // fletching from agility
		xp[7] += (tc.target(17) - xp[17]) * 0.25; // magic from agility
	}

	if(xp[18] < target_xp) { // thieving
		xp[7] += (target_xp - xp[18]) * 0.04; // magic from thieving
	}

	if(xp[15] < tc.target(15)) { // mining
		xp[7] += (tc.target(15) - xp[15]) * 0.15; // magic from mining
	}

	var bonus_melee = 0;
	if(xp[19] < target_xp) { // slayer
		var pre93 = Math.min(7195629, target_xp) - Math.min(7195629, xp[19]);
		var post93 = target_xp - Math.max(7195629, xp[19])

		xp[5] += pre93 * 1.25; // ranged from slayer
		bonus_melee += pre93 * 2.25; // melee from slayer
		xp[7] += pre93 * 0.35; // magic from slayer

		xp[5] += post93 * 0.4; // ranged from slayer
		bonus_melee += post93 * 0.47; // melee from slayer
		xp[7] += post93 * 1.0; // magic from slayer
		xp[2] += post93 * 0.88; // def from slayer
	}

	[1, 3, 2].forEach(function(s) {
		var needed = target_xp - xp[s];
		var used = Math.min(needed, bonus_melee);
		xp[s] += used;
		bonus_melee -= used;
	});

	if(xp[2] < target_xp) { // def
		xp[5] += (target_xp - xp[2]); // ranged from def
	}
}
