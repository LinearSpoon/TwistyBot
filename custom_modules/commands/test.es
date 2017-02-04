
var long_string = '';

for(var i = 0; i < 5000; i++)
{
	if (Math.random() < 0.01)
		long_string += '\n';
	else
		long_string += 'x';
}

module.exports.help = {
	name: 'test',
	text: 'A test command.',
	category: 'Admin'
};
module.exports.params = {
	min: 0,
	max: 0,
	help: `Usage: !test`
};
module.exports.whitelist = config.get('admin_channels');

module.exports.command = async function(client, message, params) {
	message.channel.splitsend('a');


	var data = {
		datasets: [
			{
				label: 'Junk test data',
				data:[
					{"x": new Date(2001,1,1).getTime(),"y": 28},
					{"x": new Date(2001,1,2).getTime(),"y": 55},
					{"x": new Date(2001,1,3).getTime(),"y": 43},
					{"x": new Date(2001,1,4).getTime(),"y": 91},
					{"x": new Date(2001,1,6).getTime(),"y": 81},
					{"x": new Date(2001,1,7).getTime(),"y": 53},
					{"x": new Date(2001,1,8).getTime(),"y": 19},
					{"x": new Date(2001,1,9).getTime(),"y": 87},
					{"x": new Date(2001,1,10).getTime(),"y": 52}
				],
				spanGaps: true
			}
		]
	}



	util.graph.line_chart(data).then(buffer => message.channel.sendFile(buffer, 'test.png', 'Chart Test'));
	//return long_string;
};
