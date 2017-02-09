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

		if (rule.guild && (rule.guild != '*' && rule.guild != guild))
		 	continue; // Wrong guild

		if (rule.channel && (rule.channel != '*' && rule.channel != channel))
		 	continue;	// Wrong channel

		if (rule.user && (rule.user != '*' && rule.user != user))
		 	continue;	// Wrong user

		if (rule.role && !roles.has(rule.role))
			continue; // Missing role

		// Default allow if block is undefined
		return !rule.block;
	}

	// Default: block
	return false;
};
