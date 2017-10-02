let Discord = require('discord.js');

// Discord markdown functions
// https://support.discordapp.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-
Discord.italics                = function(text) { return '*' + text + '*'; };
Discord.bold                   = function(text) { return '**' + text + '**'; };
Discord.bold_italics           = function(text) { return '***' + text + '***'; };
Discord.strikeout              = function(text) { return '~~' + text + '~~'; };
Discord.underline              = function(text) { return '__' + text + '__'; };
Discord.underline_italics      = function(text) { return '__*' + text + '*__'; };
Discord.underline_bold         = function(text) { return '__**' + text + '**__'; };
Discord.underline_bold_italics = function(text) { return '__***' + text + '***__'; };
Discord.code_block             = function(text) { return '```\n' + text + '```'; };
Discord.inline_code            = function(text) { return '`' + text + '`'; };
Discord.json                   = function(value) { return '```json\n' + JSON.stringify(value, null, 2) + '```'; };
Discord.link                   = function(link) { return '<' + link + '>'; };
Discord.masked_link            = function(text, link) { return '[' + text + '](' + link + ')'; };
Discord.Table                  = require('./extensions/Table');

// Export command parsers
module.exports.parsers = require('./parsers');

// Export default settings class
module.exports.Settings = require('./Settings');

// Load hooks of Discord.js classes
require('./extensions/Channel');
require('./extensions/Guild');
require('./extensions/Message');

// Export custom client class
module.exports.Client = require('./Client');
