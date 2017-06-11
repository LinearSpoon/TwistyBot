const querystring = require('querystring');
const FLICKR_API = 'https://www.flickr.com/services/rest?format=json&nojsoncallback=1&api_key=' + config.get('flickr_keys').key;

module.exports.get_random_photo = async function(searchtext) {
	let url = FLICKR_API + '&' + querystring.stringify({
		method: 'flickr.photos.search',
		text: searchtext,
		per_page: 1,
		page: Math.floor(Math.random() * 4000) + 1,
		extras: 'description,title,tags',
		sort: 'relevance'
	});
	let res = await util.queue_request(url, { max_attempts: 3, success_delay: 1000, failure_delay: 3000 });
	let photo = JSON.parse(res.body).photos.photo[0];
	return photo;
};

module.exports.get_photo_info = async function(photo_id, secret) {
	let url = FLICKR_API + '&' + querystring.stringify({
		method: 'flickr.photos.getInfo',
		photo_id: photo_id,
		secret: secret,
	});
	let res = await util.queue_request(url, { max_attempts: 3, success_delay: 1000, failure_delay: 3000 });
	let body = JSON.parse(res.body);
	return body.photo;
};

module.exports.get_photo_url = function(photo)
{
	return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_z.jpg`;
}
