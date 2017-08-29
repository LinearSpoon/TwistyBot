let markdown_parser = src_require('parsers/markdown');

// Accepts a { content, options } object and returns an array of { content, options } where content in each is small enough to send on Discord
function split_message(message)
{
	const MSG_HARD_LIMIT = 120;
	const MSG_SOFT_LIMIT = 110;
	if (message.content < MSG_HARD_LIMIT)
		return [ message ];

	let message_array = [];
	let parsed = markdown_parser(message.content);
	let current = { content: '', options: message.options };

	let parents = [];
	let pending_open = 0; // Number of parents whose tags need to be opened when content is appended

	function break_message()
	{
		// Close tags that are currently open
		current.content += parents.slice(0, parents.length - pending_open).map(x => x.closetag).join('');
		message_array.push(current);
		// Signal that every tag now needs to be opened
		pending_open = parents.length;
		current = { content: '', options: {} };
	}

	function append(text)
	{
		// If any parents need their tags opened, do it now
		if (pending_open > 0)
		{
			current.content += parents.slice(-pending_open).map(x => x.opentag).join('');
			pending_open = 0;
		}
		current.content += text;
	}

	function split(node)
	{
		console.log('node: ', node);
		if (current.content.length + node.content.length < MSG_SOFT_LIMIT)
		{
			// It fits in the current message, just add it without trying to recurse into children
			console.log('just append');
			append(node.content);
		}
		else
		{
			// Node cannot fit into this message
			if (node.children)
			{
				// Maybe some of the children can fit
				pending_open += 1;
				parents.push(node);

				// Recurse into children
				console.log('recurse');
				node.children.forEach(split);

				// Close self tag
				// Note: pending_open should always be 0 here
				current.content += node.closetag;
				parents.pop();
			}
			else
			{
				// There are no children to split by
				// Try to split the content by newlines
				// If that fails, just push as much as possible into the current message and break it
				console.log('split by newline', node.content.split('\n'));
				node.content.split('\n').forEach(function(text, idx, arr) {
					if (text.length < MSG_SOFT_LIMIT)
					{
						console.log('newline insert');
						// If the text doesn't fit in the current message, break the message here
						if (current.content.length + text.length > MSG_SOFT_LIMIT)
							break_message();
						append(text);
					}
					else
					{
						console.log('newline split');
						// The text won't fit in any message, just break it anywhere we can
						let pos = 0;
						while(pos < text.length)
						{
							// Determine how many characters can be inserted into the current message
							let chars_remaining = MSG_SOFT_LIMIT - current.content.length;
							// Insert a substring of the length decided and start a new message
							append(text.substr(pos, chars_remaining));
							break_message();
							// Start the next substring at the end of the substring we just inserted
							pos += chars_remaining;
						}
					}

					// Add back the newline
					if (idx < arr.length - 1)
						append('\n');
				});
			}
		}
	}

	parsed.forEach(split);
	if (current.content.length > 0)
	{
		// We have an unfinished message that needs to be sent too
		message_array.push(current);
	}

	return message_array;
}



	// for each
	//		if content > 2000
	//			just break it anywhere, there's no good place
	//		if it fits, add it
	//		if not, see if the children can fit
	//			if not, break the message here
	//			repair closing tags and reset current with opening tags


module.exports = split_message;
