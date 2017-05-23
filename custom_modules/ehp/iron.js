/*
  Below code is taken from https://crystalmathlabs.com/tracker/suppliescalc.php
*/
module.exports.rates = [	0, // Overall
	0, // Attack
	0, // Defence
	0, // Strength
	0, // Hitpoints
	[0,15000,	37224,40000,	101333,48000,	273742,56000,	449428,250000,	1986068,330000,	13034431,0], // Ranged
	[0,29000,	737627,625000,	4568000,63000,	140700000,625000], // Prayer
	0, // Magic
	[0,40000,	7842,100000,	2000000,330000,	7944614,360000], // Cooking
	[0,7000,	2411,16000,	41171,42000,	737627,129000,	1986068,141000,	4415000,95000,	140300000,165000], // Woodcutting
	[0,5000,	1154,8500,	4470,31000,	37224,63000,	123660,180000], // Fletching
	[0,14000,	4470,30000,	13363,40000,	273742,65000,	737627,75000,	2421087,88000,	5902831,90000,	10692629,100000,	13034431,110000], // Fishing
	[0,45000,	13363,130500,	61512,195750,	273742,293625,	1210421,445000], // Firemaking
	[0,57000,	3258594,300000,	5106594,72000,	168800000,300000], // Crafting
	[0,40000,	37224,86300,	273742,176000], // Smithing
	[0,8000,	14833,20000,	41171,44000,	302288,60000,	547953,75000,	1986068,90000,	3258594,42000,	3900000,98000,	5902831,103000,	13034431,110000], // Mining
	[0,80000,	8750000,11000,	13034431,80000,	131500000,11000], // Herblore
	[0,6000,	13363,15000,	37224,20000,	75127,44000,	273742,57000,	3972294,59000,	9684577,62000], // Agility
	[0,15000,	61512,60000,	166636,100000,	449428,220000,	5902831,255000,	13034431,265000], // Thieving
	[0,5000,	37224,12000,	100000,15000,	449428,18000,	1210421,20000,	1986068,22000,	3258594,24000,	3972294,27500,	7195629,33000], // Slayer
	[0,10000,	2411,25000,	13363,38000,	61512,72000,	302288,110000,	1210421,235000], // Farming
	[0,8000,	7842,30000,	101333,45000,	1210421,24000,	1810421,60000,	11386000,44000,	13034431,60000,	152000000,24000,	161000000,44000], // Runecrafting
	[0,5000,	12031,40000,	247886,80000,	1986068,120000,	3972294,140000,	6517253,155000,	8771558,160000,	13034431,170000], // Hunter
	[0,20000,	18247,75000,	547953,875000,	4130000,281000,	144500000,875000] // Construction
];

module.exports.prepare = function prepare(tc) {
	var xp = tc.xp;
	var target_xp = tc.target_xp;

	if(xp[11] < target_xp) { // fishing
		xp[17] += (target_xp - Math.max(83014, xp[11])) / 11.0; // agil from fish
		//xp[3] += (target_xp - Math.max(83014, xp[11])) / 11.0; // strength from fish
	}

	//var total_melee = Math.min(xp[1], target_xp) + Math.min(xp[2], target_xp) + Math.min(xp[3], target_xp);

	//xp[1] = total_melee / 3;
	//xp[2] = total_melee / 3;
	//xp[3] = total_melee / 3;
}
