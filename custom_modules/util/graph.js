var node_canvas = require('canvas');
var ChartjsNode = require('chartjs-node');

var moment = require('moment-timezone');


// http://www.chartjs.org/docs/
const line_chart_options = {
	defaultFontColor: 'white',
	defaultColor: 'white',
	elements: {
		line: {
			backgroundColor: 'transparent',
			borderColor: 'red'
		}
	},
	scales: {
		xAxes: [{
			type: 'linear',
			position: 'bottom',
			gridLines: {
				color: 'white'
			},
			ticks: {
				callback: function(v,i,a) { return moment(v).format('MMM D, h:mm A'); }
			}
		}],
		yAxes: [{
			gridLines: {
				color: 'white'
			}
		}],
	}
};





module.exports.line_chart = function(data) {
	var chartNode = new ChartjsNode(600, 300);
	return chartNode
		.drawChart({type:'line', data: data, options: line_chart_options})
		.then( () => chartNode.getImageBuffer('image/png') );
};
