let util = require('util');
let fs = require('fs');

let readfile = util.promisify(fs.readFile);
let writefile = util.promisify(fs.writeFile);

async function main()
{
	let toc = '';
	let file = await readfile('./api.md', 'utf-8');
	file.split('\n').forEach(function(line) {
		let match = line.match(/(#{2,})\s*(?:<a name="([^"]+)"><\/a>)?\s*(.+)/);
		if (match)
		{
			// match[1] == ####
			// match[2] == anchor link
			// match[3] == title
			if (!match[2])
			{
				// Generate anchor based on title
				match[2] = match[3].toLowerCase().trim().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-').replace(/-+$/, '');
			}
			
			// Add list indentation
			toc += '\t'.repeat(match[1].length-2) + '- ';
			// Add title
			toc += '[' + match[3] + ']';
			// Add anchor link
			toc += '(#' + match[2] + ')\n';

		}
	});

	await writefile('toc.txt', toc, 'utf-8');	
}

main()
	.then( () => console.log('done'))
	.catch( err => console.log(err.stack));