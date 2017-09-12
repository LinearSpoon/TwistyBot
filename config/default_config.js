module.exports.get = function(key) {
	if (typeof this[key] === 'undefined')
		throw Error('Config missing "'+ key +'"!');
	return this[key];
};
