module.exports = function(content, options) {
	var promises = [];
	var pieces = split_message(content);
	for(var i = 0; i < pieces.length; i++)
		promises.push(this.send(pieces[i], options));
	return Promise.all(promises);
};

// Splits a long message into an array of messages short enough to send
function split_message(text)
{
	// This is really common, so check before doing any real work
	if (typeof text !== 'string' || text.length < 2000)
		return [text];

	var markdown = [
		{ token: '```', used: false},
		{ token: '`', used: false},
		{ token: '~~', used: false},
		{ token: '***', used: false},
		{ token: '**', used: false},
		//{ token: '*', used: false},
		{ token: '__', used: false},
	];
	var pieces = text.split(/(```|`|__|~~|\n|\*\*\*|\*\*)/);
	var all_messages = [];
	var current_message = "";
	for(var i = 0; i < pieces.length; i++)
	{
		if (current_message.length + pieces[i].length > 1900)
		{ // Adding this piece would be too long, split the message here
			// Repair the markdown tags...
			for(var j = 0; j < markdown.length; j++) // Go forwards
			{
				if (markdown[j].used)
					current_message += markdown[j].token;
			}
			// Save the current message
			all_messages.push(current_message.replace(/^``````|``````$/g, ''));
			// Prepare a new message and restore tags
			current_message = '';
			for(var j = markdown.length - 1; j >= 0; j--) // Go backwards
			{
				if (markdown[j].used)
					current_message += markdown[j].token;
			}
		}
		var tag = markdown.find(el => el.token == pieces[i]);
		if (tag)
		{ // We've found a tag, toggle it
			tag.used = ~tag.used;
		}
		// Add the current piece
		current_message += pieces[i];
	}
	// Push the last message
	all_messages.push(current_message.replace(/^``````|``````$/g, ''));
	// Add message count
	//for(var i = 0; i < all_messages.length; i++)
	//	all_messages[i] += '\nMessage ' + (i+1) + ' of ' + all_messages.length + '.\n';

	return all_messages.filter(m => m != '``````' && m != '');
}
