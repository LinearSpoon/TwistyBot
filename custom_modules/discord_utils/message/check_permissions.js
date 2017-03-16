// Checks a message against a permissions object
// Returns true if a rule in permissions allows the message to be processed further
// Returns false if no rules apply to the message or if a rule explicitly blocks the message
module.exports = function(permissions) {
	if (!Array.isArray(permissions))
		return false;

	// this = message
	var channel = this.channel.id;
	var user = this.author.id;
	var is_dm = this.channel.type != 'text';
	if (!is_dm)
	{
		var guild = this.channel.guild.id;
		var roles = this.member.roles;
	}

	for(var k = 0; k < permissions.length; k++)
	{
		var rule = permissions[k];

		if (is_dm && (rule.guild || rule.roles))
			continue; // Message is dm but rule is guild

		if (rule.guild && !is_match(guild, rule.guild))
			continue; // Wrong guild

		if (rule.not_guild && is_match(guild, rule.not_guild))
			continue;

		if (rule.channel && !is_match(channel, rule.channel))
			continue;	// Wrong channel

		if (rule.not_channel && is_match(channel, rule.not_channel))
			continue;

		if (rule.user && !is_match(user, rule.user))
			continue;	// Wrong user

		if (rule.not_user && !is_match(user, rule.not_user))
			continue;

		if (rule.role && !is_role_match(roles, rule.role))
			continue;	// Wrong role

		if (rule.not_role && is_role_match(roles, rule.not_role))
			continue;

		if (rule.channel_type && !is_match(channel.type, rule.channel_type))
			continue; // Wrong channel_type

		// Default allow if block is undefined
		return !rule.block;
	}

	// Default: block
	return false;
};

function is_match(value, rule)
{
	if (Array.isArray(rule))
		return rule.indexOf(value) > -1;

	return (rule == '*' || rule == value);
}

function is_role_match(roles, rule)
{
	if (Array.isArray(rule))
		return rule.findIndex(e => roles.has(e)) > -1;

	return roles.has(rule);
}
