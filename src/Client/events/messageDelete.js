module.exports = function(message) {
	console.log(`[Del] [${ message.channel.friendly_name }] ${ message.author.username }: ${ message.string_content }`);
};
