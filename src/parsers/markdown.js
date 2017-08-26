// Parses Discord markdown

// Regexes taken from Discord 8/17/2017
// bold						/^\*\*([\s\S]+?)\*\*(?!\*)/
//									match[1] => innertext
// italics				/^\b_((?:__|\\[\s\S]|[^\\_])+?)_\b|^\*(?=\S)((?:\*\*|\s+(?:[^\*\s]|\*\*)|[^\s\*])+?)\*(?!\*)/
//									match[1] => innertext if _ is used
//									match[2] => innertext if * is used
// underline			/^__([\s\S]+?)__(?!_)/
//									match[1] => innertext
// strike					/^~~([\s\S]+?)~~(?!_)/
//									match[1] => innertext
// escape					/^\\([^0-9A-Za-z\s])/
//									match[1] => innertext
// code block			/^```(([A-z0-9\-]+?)\n+)?\n*([^]+?)\n*```/
//									match[2] => language
//									match[3] => innertext
// inline code		/^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/
//									match[1] => opening ` marks
//									match[2] => innertext
// text						/^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff]|$)/ (modified)
//									match[0] => innertext
// TODO: Parse mentions, emojis, channels, etc

// Note: Order of styles array matters in ambiguous cases, eg: '******'
let styles = [
	// code block
	function(content) {
		let match = /^```(([A-z0-9\-]+?)\n+)?\n*([^]+?)\n*```/.exec(content);
		if (match)
			return { tag: '```', language: match[2], content: match[0], children: [{ content: match[3] }] };
	},

	// escape
	function(content) {
		let match = /^\\([^0-9A-Za-z\s])/.exec(content);
		if (match)
			return { content: match[0], nosplit: true };
	},

	// italics
	function(content) {
		let match = /^\b_((?:__|\\[\s\S]|[^\\_])+?)_\b|^\*(?=\S)((?:\*\*|\s+(?:[^\*\s]|\*\*)|[^\s\*])+?)\*(?!\*)/.exec(content);
		if (match)
			return { tag: match[1] ? '_' : '*', content: match[0], children: parse_markdown(match[1] || match[2]) };
	},

	// bold
	function(content) {
		let match = /^\*\*([\s\S]+?)\*\*(?!\*)/.exec(content);
		if (match)
			return { tag: '**', content: match[0], children: parse_markdown(match[1]) };
	},

	// strike
	function(content) {
		let match = /^~~([\s\S]+?)~~(?!_)/.exec(content);
		if (match)
			return { tag: '__', content: match[0], children: parse_markdown(match[1]) };
	},

	// underline
	function(content) {
		let match = /^__([\s\S]+?)__(?!_)/.exec(content);
		if (match)
			return { tag: '__', content: match[0], children: parse_markdown(match[1]) };
	},

	// inline code
	function(content) {
		let match = /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/.exec(content);
		if (match)
			return { tag: match[1], content: match[0], children: [{ content: match[2] }] };
	},

	// text
	function(content) {
		let match = /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff]|$)/.exec(content);
		if (match)
			return { content: match[0] };
	}
];

// Returns an array of { content, tag, children } objects (children is recursive)
// Example: "foo __**test**__ bar"
// [
//   {
//     "content": "foo "
//   },
//   {
//     "tag": "__",
//     "content": "__**test**__",
//     "children": [
//       {
//         "tag": "**",
//         "content": "**test**",
//         "children": [
//           {
//             "content": "test"
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "content": " bar"
//   }
// ]

function parse_markdown(content)
{
	let result = [];
	let again = true;
	while(again)
	{
		again = false;
		for(let f of styles)
		{
			let parsed = f(content);
			if (parsed)
			{
				// Rule matched
				result.push(parsed);

				// Remove parsed text from content
				content = content.slice(parsed.content.length);

				// Go again if we didn't parse the whole string
				again = content.length > 0;
				break;
			}
		}
	}

	return result;
}

module.exports = parse_markdown;
