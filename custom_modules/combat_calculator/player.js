var stances = require(__dirname + '/defines.js').stances;
var styles = require(__dirname + '/defines.js').styles;
var slots = require(__dirname + '/defines.js').slots;

function player()
{
	this.levels = { attack:99, strength:99, defense:99, magic:99, range:99, hp:99, prayer:99};
	this.boosts = {};

	this.stance = stances.accurate;
	this.style = styles.crush;

	this.special_attack = false;

	this.gear = {
		weapon: null,
		shield: null,
		helmet: null,
		body: null,
		legs: null,
		gloves: null,
		cape: null,
		boots: null,
		ring: null,
		ammo: null,
		necklace: null
	};

	this.update();
}

player.prototype.equip = function(items)
{
	for(var i in items)
	{
		var item = items[i];
		if (item.slot == slots.two_hand)
		{ // Equipping a 2h weapon, remove shield and equip in weapon slot
			this.gear.shield = null;
			this.gear.weapon = item;
			continue;
		}

		if (item.slot == slots.shield && this.gear.weapon.slot == slots.two_hand)
		{ // Wearing a 2h weapon and equipping a shield
			this.gear.weapon = null;
			this.gear.shield = item;
			continue;
		}

		// Else, normal equip
		this.gear[item.slot] = item;
	}

	this.update();
};



player.prototype.attack_roll = function()
{
	if (this.style == styles.range)
	{
		var a = this.levels.range;
		var b = this.att_bonus.range;

		if (this.boosts.sharp_eye)
			a *= 1.05;
		if (this.boosts.hawk_eye)
			a *= 1.10;
		if (this.boosts.eagle_eye)
			a *= 1.15;

		if (this.stance == stances.accurate)
			a += 3;

		a = Math.floor(a + 8);
		// void bonus

	}
	else if (this.style == styles.magic)
	{

	}
	else // melee style
	{


	}
};

// Update boosts/bonuses & check compatibility
player.prototype.update = function()
{
	// Reset everything
	this.warnings = [];
	this.att_bonus = {crush:0, slash:0, stab:0, magic:0, range:0};
	this.def_bonus = {crush:0, slash:0, stab:0, magic:0, range:0};
	this.melee_str = 0;
	this.magic_str = 0;
	this.range_str = 0;
	this.pray_bonus = 0;

	// Update bonuses
	for(var i in this.gear)
	{
		var item = this.gear[i];
		this.att_bonus.crush += item.crush_att;
		this.att_bonus.slash += item.slash_att;
		this.att_bonus.stab += item.stab_att;
		this.att_bonus.magic += item.magic_att;
		this.att_bonus.range += item.range_att;

		this.def_bonus.crush += item.crush_def;
		this.def_bonus.slash += item.slash_def;
		this.def_bonus.stab += item.stab_def;
		this.def_bonus.magic += item.magic_def;
		this.def_bonus.range += item.range_def;

		this.melee_str += item.melee_str;
		this.magic_str += item.magic_str;
		this.range_str += item.range_str;
		this.pray_bonus += item.prayer;
	}

	// Calculate boosted levels
};
