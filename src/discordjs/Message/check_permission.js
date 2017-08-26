// Evaluates permissions in the context of a message
// Returns true if the action is allowed
// Rules are evaluated in the order passed, the first rule that matches decides the result
// If no rules match, the default is to allow

module.exports = function(...permissions) {
	// Flatten parameters into an array of single rules
	let rules = [].concat(...permissions);

	let user_id = this.author.id;
	let channel_id = this.channel.id;
	let channel_type = this.channel.type;

	let is_guild = this.channel.type == 'text';
	if (is_guild)
	{
		// Don't use let so variables are visible below this block
		var owner = this.guild.ownerID;
		var guild_id = this.guild.id;
		// Invisible members are not always available in large guilds (250+ members?)
		// https://github.com/hydrabolt/discord.js/issues/1165
		// We can either fetch their profile with guild.fetchMember(user_id) or just assume they have no roles
		// TODO: Fetch their roles properly
		var roles = (this.member ? this.member.roles : new Map());
	}

	// Find the first matching rule
	let match = rules.find(function(rule) {
		if (!is_guild && (rule.guild || rule.role || rule.not_leader || rule.leader || rule.not_guild || rule.not_role))
			return; // This rule is only for guilds

		if (rule.guild && !is_match(guild_id, rule.guild))
			return; // Wrong guild

		if (rule.not_guild && is_match(guild_id, rule.guild))
			return;

		if (rule.channel && !is_match(channel_id, rule.channel))
			return;	// Wrong channel

		if (rule.not_channel && is_match(channel_id, rule.not_channel))
			return;

		if (rule.user && !is_match(user_id, rule.user))
			return;	// Wrong user

		if (rule.not_user && !is_match(user_id, rule.not_user))
			return;

		if (rule.role && !is_role_match(roles, rule.role))
			return;	// Wrong role

		if (rule.not_role && is_role_match(roles, rule.not_role))
			return;

		if (rule.channel_type && !is_match(channel_type, rule.channel_type))
			return; // Wrong channel_type

		if (rule.leader && user_id != owner)
			return;

		if (rule.not_leader && user_id == owner)
			return;

		return true;
	});

	return match ? match.allow : true;
};

function is_match(id, rule)
{
	if (Array.isArray(rule))
		return rule.includes(id);

	return (rule == '*' || rule == id);
}

function is_role_match(roles, rule)
{
	if (Array.isArray(rule))
		return rule.find(e => roles.has(e));

	return roles.has(rule);
}
