let Discord = require('discord.js');

class Command
{
	constructor(client, options)
	{
		this.client = client;
		this.help = options.help;
		this.params = options.params || {};
		this.permissions = options.permissions || [];
		this.run = options.run;
		this.name = options.name;
		this.category = options.category;
	}

	helptext(prefix)
	{
		if (!this.help)
			return ''; // No help defined

		// Usage
		let help = Discord.underline('Usage:') + Discord.code_block(`${ prefix }${ this.name } ${ this.help.parameters }`);

		// Description
		help += Discord.underline('\n\Description:\n') + `${ this.help.description }`;

		// Details
		if (this.help.details && this.help.details.length > 0)
			help += '\n\n' + this.help.details;

		// Examples
		if (this.help.examples && this.help.examples.length > 0)
		{
			let name = this.name;
			help += '\n\n' + Discord.underline('Examples:') + '\n';

			this.help.examples.forEach( function(example) {
				if (typeof example === 'string')
					help += Discord.code_block(`${ prefix }${ name } ${ example }`);
				else
					help += '\n' + example.result + Discord.code_block(`${ prefix }${ name } ${ example.params }`);
			});
		}
		return help;
	}

	// Evaluates permissions in the context of a message
	// Returns true if the action is allowed
	async check_permission(message)
	{
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

		let command_name = this.name;

		let user_id = message.author.id;
		let channel_id = message.channel.id;
		let channel_type = message.channel.type;

		let is_guild = message.channel.type == 'text';
		if (is_guild)
		{
			var owner = message.guild.ownerID;
			var guild_id = message.guild.id;
			var roles = message.member.roles;
			var custom_rules = await message.guild.config.get('permissions');
		}

		// Flatten parameters into an array of single rules
		// Rules are evaluated in ascending order, the first rule that matches decides the result
		// If no rules match, the default is to allow
		let rules = [].concat(
			// Global rules
			this.client.global_permissions,
			// Command specific rules
			this.permissions,
			// Guild leader rules
			await custom_rules || []
		);

		// Find the first matching rule
		let match = rules.find(function(rule) {
			// TODO: Aliases
			if (rule.command && !(rule.command == '*' || rule.command == command_name))
				return; // Wrong command

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

			if (rule.not_user && is_match(user_id, rule.not_user))
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

		// If a match was found and has block or allow, use the rule to decide
		if (match && typeof match.block === 'boolean')
			return !match.block;
		if (match && typeof match.allow === 'boolean')
			return match.allow;

		// Default: Allow
		return true;
	}
}

module.exports = Command;
