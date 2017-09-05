// Parameters are comma separated, eg !price hammer, tinderbox, knife
module.exports = function(content) {
	return content == '' ? [] : content.split(',').map(e => e.trim()); 
};
