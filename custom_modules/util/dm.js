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
