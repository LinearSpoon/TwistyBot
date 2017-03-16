const Discord = require('discord.js');
module.exports.help = {
	name: 'test2',
	text: 'A test command.',
	category: 'Admin'
};
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !test2`
};
module.exports.permissions = [];

module.exports.command = async function(message, params) {
	var e = new Discord.RichEmbed();

	var testimg = 'https://www.allianceonline.co.uk/product_images/LCSS0006.jpg';

	// author, small image left of author, author url
	e.setAuthor('Twisty Fork', message.author.avatarURL, testimg);
	e.addField('field1', 'value1', true);
	e.addField('field2', 'value2', true);
	e.addField('field3', 'value3', true);
	e.addField('field4', 'value4', false);
	e.setColor(0xFFFFFF);
	e.setDescription('description');
	e.setFooter('footer', testimg);
	e.setTitle('title');
	e.setThumbnail(testimg); // Add picture in top right
	e.setImage(testimg); // Full size image after fields, before footer
	e.setTimestamp(new Date());
	e.setURL(testimg); // Add link to title
	//message.channel.sendEmbed(e, 'embed test');

	console.log(message.author);
 //You can put [masked links](http://google.com) inside of rich embeds.

	message.channel.send('embed test', { embed:e });
};
