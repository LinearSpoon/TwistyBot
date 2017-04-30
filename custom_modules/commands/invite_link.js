module.exports.help = {
	name: 'invite_link',
	text: 'Show the link to invite the bot to your server.',
	category: 'General'
};
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !invite_link`
};

module.exports.permissions = [
	{ user: '*' }
];

module.exports.command = async function(message, params) {
	return Discord.link('https://discordapp.com/oauth2/authorize?&client_id=228019028755611648&scope=bot&permissions=0');
};
