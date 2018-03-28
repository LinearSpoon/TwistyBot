module.exports.help = {
	description: 'Edit permissions for this server.',
	parameters: '<command>, <action>, <rule type>, <id1>, <id2>, ...',
	details:
		'The permission system works by defining rules that allow or block the use of a command depending on the user' +
		', his roles, and channel where the command was issued. Rules are evaluated in order, with the first matching' +
		' rule deciding whether the command is allowed or blocked. If no rules match, the default action is to allow.' +
		' Note that some commands have custom permissions that cannot be overrided by this command. For example, the ' +
		' permission command is always available to server owners, even if they create a rule that would normally block' +
		' themselves from accessing it.' +
		'\n\n*command*\n    The command name or `*` to affect all commands.' +
		'\n\n*action*\n    Valid options: `allow`, `block`, `clear`' +
		'\n\n*rule type*\n    Valid options: `user`, `not_user`, `channel`, `not_channel`, `role`, `not_role`' +
		'\n\n*id1, id2, ...*\n    A list of Discord ids or \\@mentions based on the rule type. `*` may be used to match anything.',

	examples: [
		{
			params: '*, allow, user, @Twisty Fork, @Vegakargdon',
			result: 'Allow Twisty Fork and Vegakargdon to access all commands.'
		},
		{
			params: '*, block, not_channel, #BotCommands',
			result: 'Block all commands in all channels except for BotCommands.'
		},
		{
			params: 'time, block, role, @notime',
			result: 'Block time command by users who have the notime role.'
		},
		{
			params: 'pickone, block, channel, *',
			result: 'Block pickone command in all channels.'
		},
		{
			params: 'price, allow, channel, 217934790886686730',
			result: 'Allow price command in channel with ID 217934790886686730.'
		},
		{
			params: '*, clear',
			result: 'Clear all rules.'
		},
		{
			params: 'time, clear',
			result: 'Clear all rules relating to the time command.'
		},
		{
			params: '',
			result: 'List all permissions for this server.'
		}
	]
};

module.exports.permissions = [
	// Allow guild leaders
	{ leader: true, allow: true },
	// Block everyone else
	{ user: '*', block: true },
];

// Convert and validate parameters
module.exports.before = async function(Discord, client, params, info) {
	// List all commands
	if (params.length == 0)
	{
		params.todo = 'list';
		return this.continue;
	}
	
	// Clear command permissions
	if (params.length == 2)
	{
		params.todo = params[1].toLowerCase();
		params.command = params[0].toLowerCase();

		// Action must be clear to continue
		return params.todo == 'clear' ? this.continue : this.syntax;
	}

	// Add new permission
	if (params.length >= 4)
	{
		params.todo = 'add';
		params.command = params[0].toLowerCase();
		params.action = params[1].toLowerCase();
		params.rule_type = params[2].toLowerCase();
		params.ids = params.slice(3);

		// Validate action
		if (params.action != 'allow' && params.action != 'block')
			return this.sytnax;
		// Validate rule_type
		if (!(['user', 'not_user', 'role', 'not_role', 'channel', 'not_channel'].includes(params.rule_type)))
			return this.syntax;

		return this.continue;
	}

	return this.syntax;
};

module.exports.run = async function(Discord, client, params, info) {
	let permissions = await info.message.guild.config.get('permissions') || [];

	// Clear command permissions
	if (params.todo == 'clear')
	{
		permissions = permissions.filter(rule => !(params.command == '*' || params.command == rule.command));
		await info.message.guild.config.set('permissions', permissions);
	}

	// Add new permission
	if (params.todo == 'add')
	{
		// Build a rule
		let rule = {
			guild: info.message.guild.id,
			command: params.command
		};
		rule[params.action] = true;

		// TODO: Ensure command is valid

		if (params.ids.includes('*'))
		{
			// Don't store as array if rule is *
			rule[params.rule_type] = '*';
		}
		else
		{
			// The ids could be mentions or plain ids, we want only plain ids though
			// Figure out which ID cache we should check and what our @mention regex is
			let cache = null;
			let regex = null;
			switch(params.rule_type)
			{
				case 'user':
				case 'not_user':
					cache = info.message.guild.members;
					regex = /^\\?<@!?(\d+)>$/;
					break;
				case 'channel':
				case 'not_channel':
					cache = info.message.guild.channels;
					regex = /^<#(\d+)>$/;
					break;
				case 'role':
				case 'not_role':
					cache = info.message.guild.roles;
					regex = /^<@&(\d+)>$/;
					break;
			}

			let valid_ids = [];
			params.ids.forEach(id => {
				// Check if this is a mention, and extract just the ID if so
				let match = regex.exec(id);
				if (match)
				{
					id = match[1];
				}

				// Make sure the user/channel/role ID is valid
				// Possible TODO: Fetch guild member?
				if (cache.has(id))
					valid_ids.push(id);
			});

			// One last sanity check
			if (valid_ids.length == 0)
				return Discord.code_block('Could not find any of the mentions/ids in this server.');

			rule[params.rule_type] = valid_ids;
		}

		// Insert it
		permissions.push(rule);
		await info.message.guild.config.set('permissions', permissions);
	}

	// Finally, print out the current permissions set
	if (permissions.length == 0)
		return Discord.code_block('No rules, for help adding one see ' + info.prefix + 'help permission');

	let table = new Discord.Table();
	table.header('Command', 'Action', 'Type', 'IDs');

	// Data rows
	table.align('lllr');
	permissions.forEach(function(rule) {
		// Determine action
		let action = rule.allow ? 'allow' : 'block';
		// Determine rule type
		let type = ['user', 'not_user', 'role', 'not_role', 'channel', 'not_channel'].find(t => rule[t]);

		// The easy case
		if (rule[type] === '*')
			return table.push(rule.command, action, type, '*');

		// Resolve ids to names
		let ids = rule[type];
		if (type == 'user' || type == 'not_user')
		{
			ids = ids.map(function(id) {
				let member = info.message.guild.members.get(id);
				if (member) { return member.displayName; }
				return '<@' + id + '>';
			});
		}
		else if (type == 'role' || type == 'not_role')
		{
			ids = ids.map(function(id) {
				let role = info.message.guild.roles.get(id);
				if (role) { return role.name; }
				return '<@&' + id + '>';
			});
		}
		else if (type == 'channel' || type == 'not_channel')
		{
			ids = ids.map(function(id) {
				let channel = info.message.guild.channels.get(id);
				if (channel) { return channel.name; }
				return '<#' + id + '>';
			});
		}

		return table.push(rule.command, action, type, ids.join(','));
	});

	return table;
};
