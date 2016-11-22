// Discord Markdown
// https://support.discordapp.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-
module.exports.italics = function(text) {
	return '*' + text + '*';
};

module.exports.bold = function(text) {
	return '**' + text + '**';
};

module.exports.bold_italics = function(text) {
	return '***' + text + '***';
};

module.exports.strikeout = function(text) {
	return '~~' + text + '~~';
};

module.exports.underline = function(text) {
	return '__' + text + '__';
};

module.exports.underline_italics = function(text) {
	return '__*' + text + '*__';
};

module.exports.underline_bold = function(text) {
	return '__**' + text + '**__';
};

module.exports.underline_bold_italics = function(text) {
	return '__***' + text + '***__';
};

module.exports.code_block = function(text) {
	return '```' + text + '```';
};

module.exports.inline_code = function(text) {
	return '`' + text + '`';
};


var columnify = require('columnify'); // https://www.npmjs.com/package/columnify
module.exports.table = function(data, widths, aligns, header)
{
	var options = { showHeaders: false, config: {} };
	widths = widths || []; aligns = aligns || []; header = header || [];

	if (header.length > 0)
		data.unshift(header); // Prepend header to table data

	var count = Math.max(widths.length,aligns.length);
	for(var i = 0; i < count; i++)
	{
		options.config[i] = {
			minWidth: widths[i] ? widths[i] : 0,
			align: aligns[i] ? aligns[i] : 'left'
		};
	}
	
	return '```' + columnify(data, options) + '```';
};
