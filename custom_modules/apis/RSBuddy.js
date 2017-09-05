// RSB endpoints:
// https://rsbuddy.com/exchange/summary.json
// https://rsbuddy.com/exchange/names.json


let fuzzy_match = root_require('lib/fuzzy_match');
let RequestQueue = root_require('classes/RequestQueue');

const exchange_url = 'https://api.rsbuddy.com/grandExchange';

class RSBuddy
{
	constructor()
	{
		this.request_queue = new RequestQueue();
		this.dictionary = root_require('data/dictionary.js');	// Dictionary of alternate item names (key=alt name, value=real name)
		let names = root_require('data/names.json');	// cached from: https://rsbuddy.com/exchange/names.json
		this.name_cache = [];
		// Transform raw names into an array
		for(let i in names)
		{
			this.name_cache.push({
				id: parseInt(i),
				name: names[i].name,
				search_name: names[i].name.toLowerCase()
			});
		}
	}

	// Returns an array of matching items
	// Lower scores are closer matches, with zero being an exact match
	/*
		result[]
			.id
			.name
			.score
	*/
	search(name)
	{
		// Check for an exact match
		console.log(name);
		let search_name = name.toLowerCase();
		let match = this.name_cache.find( e => e.search_name == search_name );
		if (match)
		{
			return [{
				id: match.id,
				name: match.name,
				score: 0
			}];
		}

		// Check for an abbreviation match
		if (this.dictionary[search_name])
		{
			let name = this.dictionary[search_name];
			let match = this.name_cache.find( e => e.name == name );
			return [{
				id: match.id,
				name: name,
				score: 0
			}];
		}

		// Look through all items wth a fuzzy string search
		let search_result = fuzzy_match(name, this.name_cache.map(el => el.name)).slice(0, 10);
		return search_result.map( (result) => {
			let name = result.name;

			// TODO: This isn't finding the original id, but rather the id of the first matching item name
			let match = this.name_cache.find( e => e.name == name );
			return {
				id: match.id,
				name: name,
				score: result.score
			};
		});
	}


	/*
		result[id]
			.overall
			.buying
			.buyingquantity
			.selling
			.sellingQuantity
	*/
	async price(...item_ids)
	{
		// https://api.rsbuddy.com/grandExchange?a=guidePrice&i=2&i=129
		let response = await this.request_queue.push(
			{
				url: exchange_url,
				qs: {
					a: 'guidePrice',
					i: item_ids
				},
				useQuerystring: true, // Serialize ids as i=2&i=20997 instead of i[0]=2&i[1]=20997
				max_attempts: 10,
				success_delay: 500,
				failure_delay: 2000
			}
		);

		let body = JSON.parse(response.body);

		// When only 1 item id is requested, it is sent without a wrapper object
		if (item_ids.length == 1)
		{
			let result = {};
			result[item_ids[0]] = body;
			return result;
		}

		// Else it is fine to return as is
		return body;
	}

	/* result is sorted oldest data to newest
		Some fields may be undefined if no buy/sell transactions were made
		result[]
			.ts
			.buyingPrice
			.buyingCompleted
			.sellingPrice
			.sellingCompleted
			.overallPrice
			.overallCompleted
	*/
	async history(item_id)
	{
		// https://api.rsbuddy.com/grandExchange?a=graph&start=<timestamp>&g=<hours between datapoints>&i=<id>
		// https://api.rsbuddy.com/grandExchange?a=graph&i=2
		let response = await this.request_queue.push(
			{
				url: exchange_url,
				qs: {
					a: 'graph',
					i: item_id,
					g: 180
				},
				success_delay: 500,
				failure_delay: 2000
			}
		);

		return JSON.parse(response.body);
	}

	/*
		result[]
			.name
			.searched_name
			.id
			.inactive
			.very_inactive
			.last_updated
			.suggestions
			.overall_price
			.buy_price
			.sell_price
			.amount_bought
			.amount_sold
	*/
	async get_details(...item_names)
	{
		let result = [];

		// Resolve the name/id of each item
		for(let name of item_names)
		{
			let details = { searched_name: name };
			details.suggestions = this.search(name);
			result.push(details);

			// If there was no match...
			if (details.suggestions[0].score > 0)
				continue;

			details.id = details.suggestions[0].id;
			details.name = details.suggestions[0].name;
		}

		// Get a list of the item ids we need to search for
		let item_ids = result.map( details => details.id ).filter( id => id !== undefined );
		// Get the price data
		let price_data = await this.price(...item_ids);

		for(let details of result)
		{
			if (details.id === undefined)
				continue;

			let price = price_data[details.id];

			// Is the item inactive?
			if (price.overall == 0 && price.selling == 0 && price.buying == 0)
			{
				details.inactive = true;
				// Try it on the history api
				let history = await this.history(details.id);
				if (history.length == 0)
				{
					details.very_inactive = true;
					continue;
				}

				// Get the most recent data available
				history = history[history.length - 1];

				details.last_updated = history.ts;
				details.overall_price = history.overallPrice;
				details.buy_price = history.buyingPrice || 0;
				details.sell_price = history.sellingPrice || 0;
				details.amount_bought = history.buyingCompleted || 0;
				details.amount_sold = history.sellingCompleted || 0;
			}
			else
			{
				// We got current price data
				details.overall_price = price.overall;
				details.buy_price = price.buying;
				details.sell_price = price.selling;
				details.amount_bought = price.buyingQuantity;
				details.amount_sold = price.sellingQuantity;
			}
		}


		if (result.length == 1)
		{
			let first_item = result[0];
			first_item.history = await this.history(first_item.id);
			first_item.history = first_item.history.map( r => ({ x: r.ts, y: r.overallPrice }) );
		}

		return result;
	}
}

module.exports = new RSBuddy();
