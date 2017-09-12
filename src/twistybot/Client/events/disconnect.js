module.exports = function(event) {
	console.warn('[Disconnect]', event.code, event.reason);
};
