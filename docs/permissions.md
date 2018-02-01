# Permissions

Permissions in TwistyBot are expressed as an array of rules. A rule consists of a filter and an action. Filters decide who or what or where the rule takes effect. For example a rule might filter on user id to only allow a specific user to access a command. The rule's action is either to allow or to block the command. Rules are evaluated in sequence from the start of the array until a rule with a matching filter is found, then that rule's action decides if the command is allowed or blocked. If no rules have a matching filter, the default action is to allow the command.

## Global Permissions
Global permissions apply to every command and take effect before command specific rules or guild leader rules apply. Global permissions are set when you create a TwistyBot Client object.

Allow the bot owner to access all commands:
```javascript
let bot = new TwistyBot.Client({
	global_permissions: [
		{ user: 'YOUR USER ID', allow: true }
	]
});
```

Block commands in every channel except two specific channels. This sort of rule is helpful in a development environment where you want to only let the bot respond in #dev channels.
```javascript
let bot = new TwistyBot.Client({
	global_permissions: [
		{ not_channel: ['#DEV CHANNEL 1 ID', '#DEV CHANNEL 2 ID'], block: true }
	]
});
```

Block commands in several specific channels. This is the opposite of the previous example, useful in the live environment to block the bot from responding in #dev channels.
```javascript
let bot = new TwistyBot.Client({
	global_permissions: [
		{ channel: ['#DEV CHANNEL 1 ID', '#DEV CHANNEL 2 ID'], block: true } }
	]
}
```

## Command Permissions
Command specific rules take effect after global rules. Command specific permissions are set in the command options when creating a new command.

Block all users from using this command. This is useful to set "owner only" commands, where a rule in the global permissions allows the owner to use the command, and this rule blocks all other users.
```javascript
module.exports.permissions = [
	{ user: '*', block: true }
];
```

Allow only users with a specific role to use this command. Note that role filters only consider the guild where the command was sent, so this command would only usable in the guild where the role is defined.
```javascript
module.exports.permissions = [
	{ role: 'SOME ROLE ID', allow: true },
	{ user: '*', block: true }
];
```

## Guild Leader Permissions
Guild leaders can set their own permissions with the default `!permission` command. Guild leader rules take effect after global and command specific rules. This allows guild leaders to customize how the bot responds to commands in their server. Example usage can be seen by running `!help permission`.

## Rules
Rules consist of a filter and an action. Filters decide when the rule takes effect, and actions decide what happens when it does. A rule  may have multiple filters, in which case ALL of the filters must match to trigger the rule's action. If any filter doesn't match, the rule is skipped.

### Filters
The following filters act on IDs. Every filter here accepts a string containing a single ID, or an array containing multiple ID strings. You may also use the special string `'*'` to indicate "any ID".
- `guild` Rule takes effect if the command was issued in one of the listed guilds.
- `not_guild` Rule takes effect if the command was issued in any guild except what was listed.
- `channel` Rule takes effect if the command was issued in one of the listed channel.
- `not_channel` Rule takes effect if the command was issued in any channel except what was listed.
- `user` Rule takes effect if the command was issued by one of the listed users.
- `not_user` Rule takes effect if the command was issued by anyone except the listed users.
- `role` Rule takes effect if the command was issued in a guild by a member who has one of the listed roles.
- `not_role` Rule takes effect if the command was issued by anyone who does not have any of the listed roles.

The rest of the rules are not ID based.
- `channel_type` A channel type or array of channel types. Rule takes effect if the command was issued in one of the listed channel types. The options for channel types can be found [here](https://discord.js.org/#/docs/main/stable/class/Channel?scrollTo=type).
- `leader` Must be true. Rule takes effect if the command was issued by the guild leader.
- `not_leader` Must be true. Rule takes effect if the command was issued by someone other than the guild leader.

### Actions
- `allow` Must be true. Allows the command to proceed.
- `block` Must be true. Blocks the command from proceeding.

## Examples

Disallow command in private channels.
```javascript
[
	{ channel_type: [ 'dm', 'group' ], block: true }
]
```

Allow command in MYGUILD and disallow it in any other guild.
```javascript
[
	{ guild: 'MYGUILD_ID', allow: true },
	{ guild: '*', block: true }
]
```

An equivalent way to do the previous example.
```javascript
[
	{ not_guild: 'MYGUILD_ID', block: true },
]
```

Allow only guild leaders (the person who created the server) to use the command.
```javascript
[
	{ leader: true, allow: true },
	{ user: '*', block: true }
]
```

Allow MYSELF and MYFRIEND to use the command, but nobody else.
```javascript
[
	{ user: [ "MYSELF_ID", "MYFRIEND_ID" ], allow: true },
	{ user: '*', block: true }
]
```

Allow the command only if it was sent by a user with MYROLE in MYCHANNEL.
```javascript
[
	{ role: "MYROLE_ID", channel: "MYCHANNEL_ID", allow: true },
	{ user: '*', block: true }
]
```

Allow command only in MYCHANNEL. Note it is important if your bot is used in multiple guilds to add a guild filter, otherwise the not_channel filter will block the command in every channel except MYCHANNEL globally.
```javascript
[
	{ guild: "MYGUILD_ID", not_channel: "MYCHANNEL_ID", allow: true },
	{ user: '*', block: true }
]
```

Block USER1 and USER2 from using the command.
```javascript
[
	{ not_user: [ "USER1_ID", "USER2_ID" ], block: true }
]
```