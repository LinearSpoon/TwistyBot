module.exports = function(value, num_decimals) {
	return parseFloat(value).toLocaleString('en', { minimumFractionDigits: num_decimals, maximumFractionDigits: num_decimals });
};
