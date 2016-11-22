require('discord.js/src/structures/Message.js').prototype.split_channel_message = function(text)
{
	if (!text || text == '')
	{
		console.warn('Tried to send empty message!');
		return;
	}
	var discord_msg_length_limit = 1900;
	var in_code_block = false;
	var msgs = [];

	while(text.length > discord_msg_length_limit)
	{
		// Search for a newline to split on
		var split_point = text.lastIndexOf('\n', discord_msg_length_limit);
		if (split_point < 2)
			split_point = discord_msg_length_limit;

		// split into two messages, then repair split code tags
		var sub_msg = text.slice(0, split_point)
			.replace(/^\n/, '') // Remove starting newline
			.replace(/^`{1,2}([^`])/g, '```$1')	// Repair starting code tag if broken
			.replace(/([^`])`{1,2}$/g, '$1'); // Remove trailing code tag if broken

		if (in_code_block)
		{	// Previous loop cut a code block, start a new one
			sub_msg = "```" + sub_msg;
			in_code_block = false;
		}

		if (sub_msg.split("```").length % 2 == 0)
		{	// We are splitting a code block, repair it
			sub_msg += "```";
			in_code_block = true;
		}
		//console.log(sub_msg);
		msgs.push(sub_msg);
		// Remove sub_msg from text
		text = text.slice(split_point);
	}

	text = (in_code_block ? "```" : '') + text
		.replace(/^\n|\n$/g, '') // Remove starting and trailing newline
		.replace(/^`{1,2}([^`])/g, '```$1')	// Repair starting code tag if broken
		.replace(/([^`])`{1,2}$/g, '$1'); // Remove trailing code tag if broken

	// One last sanity check - don't push an empty/broken code block
	if (text != '' && text != "````" && text != "`````" && text != "``````")
		msgs.push(text);

	// Add message count if necessary
	if (msgs.length > 1)
		msgs.map( (e,i,a) => a[i] += ' (Message ' + (i+1) + ' of ' + a.length + ')');

	//console.log(msgs);
	// Send out the messages
	for(var i = 0; i < msgs.length; i++)
		this.channel.sendMessage(msgs[i]);
};


var columnify = require('columnify');
require('discord.js/src/structures/Message.js').prototype.send_columns = function(columns, showHeaders, config, options)
{
	options = options || {};
	options.showHeaders = showHeaders;

	if (config)
		options.config = config;

	var columns = columnify(columns, options);
	this.split_channel_message(util_old.wrap_code(columns));
};
