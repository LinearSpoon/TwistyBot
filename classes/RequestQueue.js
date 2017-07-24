let request = root_require('lib/request');
let sleep = root_require('lib/sleep');

class RequestQueue
{
	constructor(success_delay, failure_delay)
	{
		this.pending = [];
		this.success_delay = success_delay;
		this.failure_delay = failure_delay;
		this.promise = Promise.resolve();
	}

	async push(options)
	{
		options.timestamp = options.timestamp || Date.now();
		options.max_attempts = options.max_attempts || 3;
		options.priority = options.priority || 10;
		options.success_delay = options.success_delay || this.success_delay;
		options.failure_delay = options.failure_delay || this.failure_delay;
		options.accept_codes = options.accept_codes || [ 200 ];
		options.attempts = options.attempts || 0;

		// This promise resolves when the task is finished
		let promise = new Promise( function(resolve, reject) {
			options.resolve = resolve;
			options.reject = reject;
		});

		this.insert_task(options);
		return promise;
	}

	insert_task(task)
	{
		// Add task to queue
		this.pending.push(task);
		// Move it to the correct position
		this.pending.sort( function(a, b) {
			// Sort by highest priority then by oldest timestamp
			return (a.priority == b.priority) ? a.timestamp - b.timestamp : b.priority - a.priority;
		});
		// Run a task from the queue when the previous task finishes
		this.promise = this.promise.then( () => {
			let task = this.pending.shift();
			return this.run(task);
		});
	}

	async run(task)
	{
		try
		{
			let res = await request(task);
			task.attempts += 1;
			console.log('Request #' + task.attempts + ' to ' + res.request.url.href);
			// Is the statuss code not one of the success codes provided?
			if (task.accept_codes.indexOf(res.statusCode) == -1)
				throw Error('Could not access the server (' + res.statusCode + ': ' + res.statusMessage + ')');
			// Else, the request is considered a success
			task.resolve(res);
			return await sleep(task.success_delay);
		}
		catch(err)
		{
			//console.log('Caught request error: ' + err.message);
			if (task.attempts == task.max_attempts)
			{ // Too many failures
				task.reject(err);
				return await sleep(task.failure_delay);
			}
			// Run it again
			this.insert_task(task);
			// Every third failed attempt, wait longer than usual
			await sleep(task.attempts % 3 == 0 ? 5 * task.failure_delay : task.failure_delay);
		}
	}
}

module.exports = RequestQueue;
