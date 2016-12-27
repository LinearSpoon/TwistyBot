var vega = require('vega');

var canvas;

vega.parse.spec('line_chart.json', function(err, chart) {
	if (err)
		return console.log(err);
	var view = chart({ renderer: "canvas" }).update();
	canvas = view.canvas();
});

module.exports.line_chart = function(data) {
	return 	canvas.toBuffer();
};
