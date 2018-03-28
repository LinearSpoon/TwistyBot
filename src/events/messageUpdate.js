module.exports = function(old_message, new_message) {
	console.log(`[Mod] [${ new_message.channel.friendly_name }] ${ new_message.author.username }: ${ new_message.string_content }`);
};
