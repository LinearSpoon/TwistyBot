// Parameters are comma separated, eg !price hammer, tinderbox, knife
module.exports = function(content) {
	// Split parameters into an array
	let match = content.match(/('[^']*'|"[^"]*"|^(?=,)|[^,]+)+/g);

	if (!match)
		return [];

	// Strip quotes from quoted parameters
	return match.map(param => param
		.trim() // Remove spaces around parameter
		.replace(/^"(.*)"$/, '$1') // Remove double quoted string quotes
		.replace(/^'(.*)'$/, '$1') // Remove single quoted string quotes
	);
};
