// Parses Discord flavor markdown
// Regexes taken from Discord 8/17/2017

// Test cases:
// *\*test**						bold(\)test**
// **~~test**~~					bold(~~test)~~
// ~~**test~~**					strike(**test)**
// __**test__**					under(**test)**
// **__test**__					bold(__test)__
// ~~__test~~__					~~under(test~~)
// ~~**t*es*t~~**				strike(*italics(t)est*t)**
// __~~test__~~					under(~~test)~~
// `~~test`~~						code(~~test)~~
// ~~`test~~`						strike(`test)`
// ***									***
// *****								bold(*)
// ******								italic(italic(**))
// **a****							bold(a**)
// ****a**							italics(**)a**
// *********						bold(bold(*))

// TODO: Parse mentions, emojis, channels, etc
// Note: Order of styles array matters in ambiguous cases, eg: '******'
// Actual order from Discord seems to be:
// 	"codeBlock", "newline", "paragraph", "escape", "autolink", "url", "link", "em", "strong", "s", "u"
// 	"inlineCode", "br", "channel", "customEmoji", "emoji", "emoticon", "highlight", "mention", "roleMention", "text"
let styles = [
	// code block
	function(content) {
		let match = /^```(([A-z0-9\-]+?)\n+)?\n*([^]+?)\n*```/.exec(content);
		if (match)
		{
			// match[2] => language
			// match[3] => innertext
			return {
				opentag: '```' + (match[2] || '') + '\n',
				closetag: '```',
				content: match[0],
				children: [{ content: match[3] }]
			};
		}
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
		{
			// match[1] => innertext if _ is used
			// match[2] => innertext if * is used
			let tag = match[1] ? '_' : '*';
			return {
				opentag: tag,
				closetag: tag,
				content: match[0],
				children: parse_markdown(match[1] || match[2])
			};
		}
	},

	// bold
	function(content) {
		let match = /^\*\*([\s\S]+?)\*\*(?!\*)/.exec(content);
		if (match)
		{
			// match[1] => innertext
			return {
				opentag: '**',
				closetag: '**',
				content: match[0],
				children: parse_markdown(match[1])
			};
		}
	},

	// strike
	function(content) {
		let match = /^~~([\s\S]+?)~~(?!_)/.exec(content);
		if (match)
		{
			// match[1] => innertext
			return {
				opentag: '~~',
				closetag: '~~',
				content: match[0],
				children: parse_markdown(match[1])
			};
		}
	},

	// underline
	function(content) {
		let match = /^__([\s\S]+?)__(?!_)/.exec(content);
		if (match)
		{
			// match[1] => innertext
			return {
				opentag: '__',
				closetag: '__',
				content: match[0],
				children: parse_markdown(match[1])
			};
		}
	},

	// inline code
	function(content) {
		let match = /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/.exec(content);
		if (match)
		{
			// match[1] => tag
			// match[2] => innertext
			return {
				opentag: match[1],
				closetag: match[1],
				content: match[0],
				children: [{ content: match[2] }]
			};
		}
	},

	// text
	function(content) {
		// let match = /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff]|$)/.exec(content);
		let match = /^[\s\S]+?(?=[`~*_]|$)/.exec(content);
		if (match)
			return { content: match[0] };
	}
];

// Returns an array of { content, opentag, closetag, children } objects (children is recursive)
// Example: "foo __**test**__ bar"
// [
//   {
//     "content": "foo "
//   },
//   {
//     "opentag": "__",
//     "closetag": "__",
//     "content": "__**test**__",
//     "children": [
//       {
//         "opentag": "**",
//         "closetag": "**",
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
	console.log(content);
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

	if (content.length > 0)
		console.warn('Unable to parse:', content);

	return result;
}

module.exports = parse_markdown;
