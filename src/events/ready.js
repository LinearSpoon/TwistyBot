module.exports = function() {
	console.log('[Ready]', `https://discordapp.com/oauth2/authorize?client_id=${ this.user.id }&permissions=0&scope=bot`);
};
