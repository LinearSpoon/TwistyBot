let Canvas = require('canvas');

module.exports.help = {
	name: 'test',
	text: 'A test command.',
	category: 'Admin'
};
module.exports.params = {
	min: 0,
	max: 11111,
	help: `Usage: !test`
};
module.exports.permissions = [];

module.exports.command = async function(message, params) {
	let canvas = new Canvas(200, 200);
	let ctx = canvas.getContext('2d');

	ctx.font = '30px Impact';
	ctx.rotate(.1);
	ctx.fillText('Awesome!', 50, 100);

	var te = ctx.measureText('Awesome!');
	ctx.strokeStyle = 'rgba(0,0,0,0.5)';
	ctx.beginPath();
	ctx.lineTo(50, 102);
	ctx.lineTo(50 + te.width, 102);
	ctx.stroke();

	let e = new Discord.RichEmbed();
	e.setTitle('test');
	e.attachFile({ attachment: canvas.toBuffer(), name: 'image.png' });
	e.setImage( 'attachment://image.png' );
	return e;
};
