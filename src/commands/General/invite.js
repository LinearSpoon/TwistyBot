module.exports.help = {
	description: 'Show the link to invite the bot to your server.',
	parameters: '',
	details: ''
};

module.exports.params = {};

module.exports.permissions = [];

module.exports.run = async function(twistybot, params, options) {
	return Discord.link(`https://discordapp.com/oauth2/authorize?client_id=${ twistybot.user.id }&permissions=0&scope=bot`);
};
