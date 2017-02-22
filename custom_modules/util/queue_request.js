var Heap = require('heap');
var url = require('url');

// Pending requests indexed by hostname
var queues = {};

// Saves all the information to run the request later
function deferred_request(site, options)
{
	if (typeof options === 'undefined')
		options = {};

	var self = this;
	self.site = site;
	self.codes = options.codes || [200];
	self.max_attempts = options.max_attempts || 3;
	self.failure_delay = options.failure_delay || 5000;
	self.success_delay = options.success_delay || 1000;
	self.priority = options.priority || 0;
	self.timestamp = Date.now();
	// This Promise resolves if the request is successful
	self.promise = new Promise(function(resolve, reject) {
		self.resolve = resolve;
		self.reject = reject;
	});
}

// Begin the request
deferred_request.prototype.run = async function() {
	var attempts = 0;
	while(true)
	{
		try
		{
			//console.log('Attempt #' + attempts + ' on ' + this.site);
			var res = await util.request(this.site);
			if (this.codes.indexOf(res.statusCode) == -1)
				throw Error('Could not access the server (' + res.statusCode + ': ' + res.statusMessage + ')');
			this.resolve(res);
			return await util.sleep(this.success_delay);
		}
		catch(err)
		{
			//console.log('Caught request error: ' + err.message);
			attempts += 1;
			if (attempts == this.max_attempts)
			{ // Too many failures
				this.reject(err);
				return await util.sleep(this.failure_delay);
			}
			// Every third failed attempt, wait longer than usual
			await util.sleep(attempts % 3 == 0 ? 5 * this.failure_delay : this.failure_delay);
		}
	}
};

// Adds a request to the queue
module.exports = function(site, options)
{
	var hostname = url.parse(typeof site == 'object' ? site.url : site).hostname;

	if (!queues[hostname])
	{ // No requests made to this host
		console.log('Creating queue for', hostname);
		queues[hostname] = new Heap(function(a, b) {
			// Sort by priority then by timestamp
			return (a.priority == b.priority) ? a.timestamp - b.timestamp : b.priority - a.priority;
		});

		queues[hostname].promise = Promise.resolve();
	}

	var heap = queues[hostname];
	var pr = new deferred_request(site, options);
	heap.push(pr);
	heap.promise = heap.promise.then( () => queues[hostname].pop().run() );

	return pr.promise;
}
