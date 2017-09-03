module.exports.help = {
	name: 'checkapp',
	text: 'Checks if a player is eligible to join Deities of PvM.',
	category: 'Deities'
};
module.exports.params = {
	min: 1,
	max: 1,
	help:
`Usage: !checkapp <username>

Examples:
!check_app risko
!check_app Vegakargdon`
};
module.exports.permissions = [
	{ role: '160842785610661888', guild: '160833724886286336' }  // Council role in Deities guild
];


module.exports.command = async function(message, params) {
	// Get stats
	var stats = await apis.RuneScape.lookup_player(params[0], { priority: 1 });
	if (!stats)
		return Discord.code_block("Player not found.");

	var cb_level = apis.RuneScape.combat_level(stats);

	// Get RSJ
	var rw = await apis.RuneWatch.find(params[0], ['publish', 'private']);
	if (rw && rw.length > 0)
		return 'Player listed on RuneWatch: ' + rw[0].url;

	// Find forum app
	var profile = await apis.RuneScape.forum_profile(params[0], { priority: 1, success_delay: 5000 });
	var post_link;
	var old_threads = [];
	for(var i = 0; i < profile.length; i++)
	{
		var post = profile[i];
		console.log(post.thread_link);
		if (post.thread_link.includes('320,321,115,65944319'))
		{ // Found a post in current thread
			post_link = post.showuser_link;
		}
		if (post.thread_link.includes('320,321,880,65825048') || post.thread_link.includes('320,321,146,65761416'))
		{ // Found a post in the v2 or v1 thread
			old_threads.push(post);
		}
	}

	// Check requirements for standard application
	var s_issues = [];
	if (stats.prayer.level < 70)
		s_issues.push('Prayer level ' + stats.prayer.level + ' < 70');
	if (stats.agility.level < 70)
		s_issues.push('Agility level ' + stats.agility.level + ' < 70');
	if (stats.defence.level < 75)
		s_issues.push('Defence level ' + stats.defence.level + ' < 75');
	if (stats.range.level < 75)
		s_issues.push('Range level ' + stats.range.level + ' < 75');
	if (stats.magic.level < 75)
		s_issues.push('Magic level ' + stats.magic.level + ' < 75');
	if (stats.attack.level < 90)
		s_issues.push('Attack level ' + stats.attack.level + ' < 90');
	if (stats.strength.level < 90)
		s_issues.push('Strength level ' + stats.strength.level + ' < 90');
	if (cb_level < 115)
		s_issues.push('Combat level ' + cb_level + ' < 115');
	if (stats.overall.level < 1500)
		s_issues.push('Total level ' + stats.overall.level + ' < 1500');


	var rt_issues = [];
	if (stats.prayer.level < 44)
		rt_issues.push('Prayer level ' + stats.prayer.level + ' < 44');
	if (stats.range.level < 95)
		rt_issues.push('Range level ' + stats.range.level + ' < 95');
	if (stats.defence.level < 90)
		rt_issues.push('Defence level ' + stats.defence.level + ' < 90');
	if (cb_level < 105)
		rt_issues.push('Combat level ' + cb_level + ' < 105');
	if (stats.overall.level < 1500)
		rt_issues.push('Total level ' + stats.overall.level + ' < 1500');

	if (s_issues.length > 0 && rt_issues.length > 0)
	{
		return 'Missing requirements for a standard application:\n' + s_issues.join('\n')
			+ '\n\nMissing requirements for a range tank application:\n' + rt_issues.join('\n')
			+ (post_link ? '\n\nForum app: ' + Discord.link(post_link) : '\n\nForum app not found.');
	}

	let accepted_form =
`-----------------------------
Accepted Applicant Form
-----------------------------
Username: ${ profile.name || params[0] }
Gear checked:
Clean on RuneWatch: yes
Clean on RSJ:
Rank given:
Combat: ${ Math.floor(cb_level) + (s_issues.length > 0 ? ' (Range tank)' : '') }
Recruited by:

${ post_link ? 'Forum app: ' + post_link : 'Forum app not found.' }`;

	if (old_threads.length > 0)
	{
		accepted_form += '\n\nFound posts on previous thread:\n' + old_threads.map(p => Discord.link(p.showuser_link)).join('\n');
	}

	return accepted_form;
};
