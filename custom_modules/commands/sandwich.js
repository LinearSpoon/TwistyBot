module.exports.help = {
	name: 'sandwich',
	text: 'Make a sandwich.',
	category: 'General'
};
module.exports.params = {
	min: 0,
	max: 1,
	help:
`Usage: !sandwich

Note if you see a blank message from this command, you may have embeds disabled. Enable them at Settings->Text & Images->Link Preview.`
};
module.exports.permissions = [
	{ user: '*' }
];


const url = 'http://api.flickr.com/services/feeds/photos_public.gne?tags=sandwich&tagmode=any&format=json';
module.exports.command = async function(client, message, params) {
	var d = await util.queue_request(url, { max_attempts: 3, success_delay: 1000, failure_delay: 3000 });
	d = JSON.parse(d.body.replace(/^jsonFlickrFeed\(|\)$/g,''));
	var rnd = Math.floor(Math.random() * d.items.length);
	var image_src = d.items[rnd].media.m.replace("_m", "_b");
	var e = new Discord.RichEmbed();
	e.setImage(image_src);
	return e;
};
