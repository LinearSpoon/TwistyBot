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

// Export default config class
module.exports.config = require('./Config');

// Load hooks of Discord.js classes
require('./extensions/Channel');
require('./extensions/Guild');
require('./extensions/GuildMember');
require('./extensions/Message');
require('./extensions/User');

// Export custom client class
module.exports.Client = require('./Client');

// Export command class
module.exports.Command = require('./Command');
