let markdown_parser = require('../../parsers/markdown');

// Class that manages markdown tags that need to be opened or closed
class Tags
{
	constructor()
	{
		this.parents = [];
		this.need_open = 0;
	}

	open(node)
	{
		this.parents.push(node);
		this.need_open += 1;
	}

	close()
	{
		this.parents.pop();
	}

	dump_open()
	{
		if (this.need_open == 0)
			return '';

		let tags = this.opentags;
		this.need_open = 0; // All tags are now opened
		return tags;
	}

	dump_close()
	{
		let tags = this.closetags;
		this.need_open = this.parents.length; // All tags need to be opened again
		return tags;
	}

	get opentags()
	{
		return this.parents.slice(-this.need_open).map(x => x.opentag).join('');
	}

	get closetags()
	{
		return this.parents.slice(0, this.parents.length - this.need_open).map(n => n.closetag).join('');
	}
}

// Class that manages the current message
class Message
{
	constructor(options)
	{
		this.tags = new Tags();
		this.options = options;
		this.content = '';
	}

	break_here()
	{
		// Prepare an object for discord.js send()
		let result = {
			content: this.content + this.tags.dump_close(),
			options: this.options
		};
		// Reset the message
		this.content = '';
		this.options = {};

		return result;
	}

	append(text)
	{
		// If any tags need opened, do it before adding the text
		this.content += this.tags.dump_open();
		this.content += text;
	}

	length_if_appending(text)
	{
		return this.content.length + this.tags.opentags.length + this.tags.closetags.length + text.length;
	}
}

// Accepts a { content, options } object and returns an array of { content, options } where content in each is small enough to send on Discord
function split_message(message)
{
	// Hard limit on Discord message size
	const MSG_SIZE_LIMIT = 2000;
	// Breaking a message after this size is OK if it can end on a newline
	const MSG_SOFT_BREAK = 1800;

	// Go for the easy win
	if (message.content.length < MSG_SIZE_LIMIT)
		return [ message ];

	// Else the text is too long to fit in one message
	let message_array = [];
	let parsed = markdown_parser(message.content);
	let current = new Message(message.options);

	function split(node)
	{
		//console.log('node: ', node);
		// If this node fits in the current message, add it without recursing into children
		if (current.length_if_appending(node.content) < MSG_SIZE_LIMIT)
		{
			current.append(node.content);
		}
		else
		{
			// Else, this node cannot fit into the message
			if (node.children)
			{
				// Maybe some of the children can fit
				current.tags.open(node);

				// Recurse into children
				node.children.forEach(split);

				// Close self tag
				// Note: need_open should always be 0 here
				current.content += node.closetag;
				current.tags.close();
			}
			else
			{
				// There are no children to split by
				// Try to split the content by newlines
				// If that fails, just push as much as possible into the current message and break it
				node.content.split('\n').forEach(function(line, idx, arr) {
					// Add back the newline
					if (idx < arr.length - 1)
						line += '\n';

					// If this line fits, append it and move to the next line
					if (current.length_if_appending(line) < MSG_SIZE_LIMIT)
						return current.append(line);

					// Else the line doesn't fit in the current message
					// If the current message is mostly full, just break it now
					if (current.content.length > MSG_SOFT_BREAK)
					{
						message_array.push(current.break_here());
						// If this line fits now, append it and move to the next line
						if (current.length_if_appending(line) < MSG_SIZE_LIMIT)
							return current.append(line);
					}

					// Else, the line isn't going to fit and needs to be broken up further
					// Next best option if we can't break on newline is space
					line.split(' ').forEach(function(word, idx, arr) {
						// Add back the space
						if (idx < arr.length - 1)
							word += ' ';

						// If the word is too big to fit in any message
						if (word > MSG_SOFT_BREAK)
						{
							// It sucks, but we have to split it anywhere we can
							let pos = 0;
							while(pos < word.length)
							{
								// Determine how many characters can be inserted into the current message
								let chars_remaining = MSG_SIZE_LIMIT - current.length_if_appending('');
								// Insert a substring of the length decided
								let sub = word.substr(pos, chars_remaining);
								current.append(sub);
								// If we filled up the message, split it
								if (sub.length == chars_remaining)
								{
									message_array.push(current.break_here());
								}
								// Start the next substring at the end of the substring we just inserted
								pos += chars_remaining;
							}
							return;
						}

						// We know this word is small enough to fit in a message without further splitting
						// If we can't fit the word in this message, put it in the next one
						if (current.length_if_appending(word) > MSG_SIZE_LIMIT)
						{
							message_array.push(current.break_here());
						}

						return current.append(word);
					});
				});
			}
		}
	}

	parsed.forEach(split);
	if (current.content.length > 0)
	{
		// We have an unfinished message that needs to be sent too
		message_array.push(current.break_here());
	}

	return message_array;
}

module.exports = split_message;
