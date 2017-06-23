module.exports.help = {
	name: 'sandwich',
	text: 'Make a sandwich.',
	category: 'General'
};
module.exports.params = {
	min: 0,
	max: 1,
	help: `Usage: !sandwich <searchterm>`
};
module.exports.permissions = [
	{ user: '*' }
];

function replace_links(text)
{
	return text.replace(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g, function(match, p1, p2, offset, string) {
		return Discord.masked_link(p2, p1);
	});
}

module.exports.command = async function(message, params) {
	let photo = await apis.Flickr.get_random_photo(params[0] || 'sandwich');
	let photo_url = apis.Flickr.get_photo_url(photo);
	console.log(photo);
	console.log(photo_url);
	var e = new Discord.RichEmbed();
	e.setTitle(photo.title);
	let description = replace_links(photo.description._content);
	if (description.length > 2000)
	{
		description = description.slice(0,2000) + '…';
	}
	e.setDescription(description);
	e.setImage(photo_url);
	if (photo.tags)
		e.addField('Tags:', photo.tags);
	return e;
};
