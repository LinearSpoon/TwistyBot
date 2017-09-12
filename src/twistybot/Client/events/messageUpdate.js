module.exports = function(message) {
	console.log(`[Mod] [${ message.channel.friendly_name }] ${ message.author.username }: ${ message.string_content }`);
};
