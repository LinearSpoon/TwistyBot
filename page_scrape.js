process.env['FORCE_COLOR'] = 'true';

var page = "http://services.runescape.com/m=forum/users.ws?searchname=Sin%A0Dragon&lookup=view";
//var selector = '#forums--userview > div > div.contents > main > section.threads-list > article'
var selector = '#forums--userview > div > div.contents > main > aside > div > a > figure > img'

var download = require('./custom_modules/util/download');
var load_file = require('./custom_modules/util/load_file');
var save_file = require('./custom_modules/util/save_file');
var cheerio = require('cheerio');
var pd = require('pretty-data').pd;
var chalk = require('chalk');
var $, ready;

if (process.argv[2] == 'download')
{
	ready = download(page)
		.then( function(body) {
			$ = cheerio.load(body);
			console.log('Page loaded.');
			return save_file('./storage/saved.html', body);
		})
		.then( () => console.log('Page saved.'))
}
else
{
	ready = load_file('./storage/saved.html')
		.then( function(body) {
			$ = cheerio.load(body);
			console.log('Page loaded.');
		});
}

ready.then( () => {
	var elements = $(selector);

	console.log(elements.length + ' elements matched.');
	//elements.each( print_many );

	var first = $(elements.first());

/*
	print_one(first.children('a.thread-plate__last-posted'));
	// html = 20-Jan-2017 02:24:37

	print_one(first.children('a.thread-plate__post-by-user'));
	// href = forums.ws?317,318,453,65871674,&showuser=Sin%A0Dragon

	print_one(first.find('div.thread-plate__details > h3 > a'))
	// html = OSBuddy Nonsense.
	// href = forums.ws?317,318,453,65871674

	print_one(first.find('div.thread-plate__details > p > a.thread-plate__forum-name'))
	// html = Old School RuneScape General
	*/
	print_one(first)

}).catch(err => console.log);



function print_one(e) {
	if (!e)
		console.log('Undefined!!!');
	e = $(e);

	var elem = chalk.magenta(e.prop('tagName').toLowerCase());
	if (e.attr('class'))
		elem += chalk.yellow(' class') + '="' + chalk.cyan(e.attr('class')) + '"';
	console.log("  [ELEM]", chalk.gray('<' + elem + '>'));

	if (e.attr('href'))
		console.log("  [HREF]", e.attr('href'));

	if (e.val())
		console.log("  [VALUE]",e.val());

	if (e.prop('src'))
		console.log("  [SRC]", e.prop('src'));

	if (e.html())
	{
		var pretty_html =  pd.xml(e.html().replace(/^\s*|\s*$/g, ''));
		if (pretty_html.indexOf('\n') > -1)
			pretty_html = pretty_html.replace(/^|\n/g, '\n    ');
		if (pretty_html)
			console.log("  [HTML]", chalk.gray(pretty_html));
	}

	console.log('');
}

function print_many(i, e) {
	console.log(chalk.blue('[' + i + ']'))
	print_one(e);
}
