var Discord = require('discord.js');



Discord.Client.prototype.get_text_channel = require('./get_text_channel.js');
Discord.Client.prototype.get_dm_channel = require('./get_dm_channel.js');



module.exports = Discord;
global.Discord = Discord;
