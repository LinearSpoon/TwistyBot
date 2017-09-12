/*

		Each rule can allow, block, or skip (if it does not match)
		{ user: '217934790886686730', allow: true }
		{ not_channel: '1212121212121212121', block: true }
		// command specific rules...
		// Allow guild leader:
		{ leader: true, allow: true }
		// leader set guild specific rules...
		// Default allow:
		{ user: '*', allow: true }

		Guild rules?
		{ guild: '12893129128121', .... }
		user: allow/block
		not_user: allow/block
		role: allow/block
		not_role: allow/block
		channel: allow/block
		not_channel: allow/block
		!permission, allow, user, <user_id>, <user_id>, ...
		!permission, block, not_channel, <channel_id>
		!permission, clear, role, <role_id>
		!permission
			=> all rules

	// Database:
		guilds
			.command_prefix

		permissions
			.id
			.guild_id
			.rule <JSON>

	// Stats
		# messages received
		# each command


*/
