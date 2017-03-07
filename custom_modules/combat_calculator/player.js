const STANCES = require(__dirname + '/defines.js').stances;
const STYLES = require(__dirname + '/defines.js').styles;
const SLOTS = require('./defines.js').slots;

function Player()
{
	this.levels = { attack:99, strength:99, defence:99, magic:99, range:99, hp:99, prayer:99};
	this.boosts = {
		scp: true,
		hp: 1
	};

	this.stance = STANCES.accurate;
	this.style = STYLES.crush;

	this.special_attack = false;

	this.gear = {
		weapon: null,
		shield: null,
		head: null,
		body: null,
		leg: null,
		hand: null,
		cape: null,
		boots: null,
		ring: null,
		ammo: null,
		neck: null
	};

	this.update();
}

Player.prototype.equip = function(items)
{
	if (!Array.isArray(items))
		items = [items]; // Convert single item to array

	for(var i in items)
	{
		var item = items[i];
		if (item.slot == SLOTS.two_hand)
		{ // Equipping a 2h weapon, remove shield and equip in weapon slot
			this.gear.shield = null;
			this.gear.weapon = item;
			continue;
		}

		if (item.slot == SLOTS.shield && this.gear.weapon.slot == SLOTS.two_hand)
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



Player.prototype.attack_roll = function()
{

};

Player.prototype.max_hit = function()
{

};

Player.prototype.update = function()
{
	var bonuses = {
		prayer: 0,
		speed: 6, // Default unarmed speed

		attack: {
			stab: 0,
			slash: 0,
			crush: 0,
			magic: 0,
			range: 0,
		},
		defence: {
			stab: 0,
			slash: 0,
			crush: 0,
			magic: 0,
			range: 0,
		},
		strength: {
			melee: 0,
			magic: 0,
			range: 0
		}
	};

	for(var i in this.gear)
	{
		var item = this.gear[i];
		if (!item)
			continue; // Nothing equipped

		bonuses.prayer += item.prayer;
		bonuses.attack.stab += item.attack.stab;
		bonuses.attack.slash += item.attack.slash;
		bonuses.attack.crush += item.attack.crush;
		bonuses.attack.magic += item.attack.magic;
		bonuses.attack.range += item.attack.range;
		bonuses.defence.stab += item.defence.stab;
		bonuses.defence.slash += item.defence.slash;
		bonuses.defence.crush += item.defence.crush;
		bonuses.defence.magic += item.defence.magic;
		bonuses.defence.range += item.defence.range;
		bonuses.strength.melee += item.strength.melee;
		bonuses.strength.magic += item.strength.magic;
		bonuses.strength.range += item.strength.range;
	}

	if (this.gear.weapon)
		bonuses.speed = this.gear.weapon.speed;

	// Save calculated totals
	this.bonuses = bonuses;

	var boosted_levels = {
		attack: this.levels.attack,
		strength: this.levels.strength,
		defence: this.levels.defence,
		magic: this.levels.magic,
		range: this.levels.range,
		hp: this.levels.hp,
		prayer: this.levels.prayer
	};

	if (this.boosts.scp)
	{
		boosted_levels.attack = 5 + Math.floor(this.levels.attack * 1.15);
		boosted_levels.strength = 5 + Math.floor(this.levels.strength * 1.15);
		boosted_levels.defence = 5 + Math.floor(this.levels.defence * 1.15);
	}

	// Apply overrides last
	for(var i in boosted_levels)
		if (this.boosts[i])
			boosted_levels[i] = this.boosts[i];

	this.boosted_levels = boosted_levels;
};


module.exports = Player;
