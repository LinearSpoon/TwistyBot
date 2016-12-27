
var long_string = '';

for(var i = 0; i < 5000; i++)
{
	if (Math.random() < 0.01)
		long_string += '\n';
	else
		long_string += 'x';
}

module.exports = async function(message, params) {

	message.channel.sendFile(util.graph.line_chart(), 'test.jpg', 'Chart Test');
	//return long_string;
};
