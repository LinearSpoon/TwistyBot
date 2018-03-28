let Discord = require('discord.js');
let comma_separated = require('./lib/parse_csv_params.js');

class Command
{
	constructor(client, options)
	{
		this.client = client;
		this.help = options.help;
		this.params = options.params || {};
		this.permissions = options.permissions || [];
		this.before = options.before;
		this.run = options.run;
		this.after = options.after;
		this.init = options.init;
		this.name = options.name;
		this.category = options.category;
		this.aliases = options.aliases || [];

		// Recent command run times, limited to 10 entries
		this.timings = [];
		this.use_count = 0;
		this.err_count = 0;

		// Pre run function actions
		this.cancel = Symbol.for('cancel');
		this.continue = Symbol.for('continue');
		this.syntax_error = Symbol.for('syntax_error');
	}

	/*
		Executes the command and returns a response
		info
			.message
			.channel
			.name
			.prefix
			.text
			.embeds
			.reactions
	*/
	async execute(raw_params, info)
	{
		// Record time when command starts executing
		let start_time = process.hrtime();

		// Prepare parameters
		let params = comma_separated(raw_params);
		params.raw = raw_params;

		// Check parameters
		if (typeof this.params.min === 'number' && params.length < this.params.min)
			return this.helptext(info.prefix);
		if (typeof this.params.max === 'number' && params.length > this.params.max)
			return this.helptext(info.prefix);
		
		// Do we have a prerun function?
		if (typeof this.before == 'function')
		{
			try
			{
				let action = await this.before(Discord, this.client, params, info);
				// if prerun returns a value, it wants us to do something interesting
				if (action)
				{
					if (action == this.cancel)
						return; // No further processing
					if (action == this.syntaxerr)
						return this.helptext(info.prefix); // Syntax error - show help text
					if (action != this.continue)
						return action; // Anything other than continue is an actual response
				}
			}
			catch(err)
			{
				// Prerun function might load data for run, we can't continue if it errored
				this.client.log_error(err, info.message);
				// Use the error message as the response
				return Discord.code_block('An error occurred before running the command:\n' + err.message);
			}
		}

		// Run the command
		let response = null;
		info.channel.startTyping();
		try
		{
			response = await this.run(Discord, this.client, params, info);
			this._save_usage(start_time, false);
		}
		catch(err)
		{
			// Log the error
			this._save_usage(start_time, true);
			this.client.log_error(err, info.message);
			// Use the error message as the response
			response = Discord.code_block('An error occurred before running the command:\n' + err.message);
		}
		// Always stop typing
		info.channel.stopTyping();

		// Do we have a postrun function?
		if (typeof this.after == 'function')
		{
			try
			{
				await this.after(Discord, this.client, params, info);
			}
			catch (err)
			{
				// Log the error, but push on since we have a valid response
				this.client.log_error(err, info.message);
			}
		}

		return response;
	}

	// Returns error statistics
	/*
		result
			.uses
			.errors
			.average_time_ms
	*/
	stats()
	{
		if (this.timings.length == 0)
		{
			return {
				uses: this.use_count,
				errors: this.err_count,
				average_time_ms: -1
			};
		}

		let total_time_ms = 0;
		for(let i = 0; i < this.timings.length; i++)
			total_time_ms += this.timings[i];

		return {
			uses: this.use_count,
			errors: this.err_count,
			average_time_ms: total_time_ms / this.timings.length
		};
	}

	reset_stats()
	{
		this.use_count = 0;
		this.err_count = 0;
		this.timings = [];
	}

	// Return command help text
	helptext(prefix)
	{
		if (!this.help)
			return ''; // No help defined

		// Usage
		let help = Discord.underline('Usage:') + Discord.code_block(`${ prefix }${ this.name } ${ this.help.parameters }`);

		// Description
		help += Discord.underline('\nDescription:\n') + `${ this.help.description }`;

		// Details
		if (this.help.details && this.help.details.length > 0)
			help += '\n\n' + this.help.details;

		// Examples
		if (this.help.examples && this.help.examples.length > 0)
		{
			let name = this.name;
			help += '\n\n' + Discord.underline('Examples:') + '\n';

			this.help.examples.forEach( function(example) {
				if (typeof example === 'string')
					help += Discord.code_block(`${ prefix }${ name } ${ example }`);
				else
					help += '\n' + example.result + Discord.code_block(`${ prefix }${ name } ${ example.params }`);
			});
		}

		// Aliases
		if (this.aliases.length > 0)
			help += '\n' + Discord.underline('Aliases:\n') + this.aliases.join(', ');

		return help;
	}

	// Evaluates permissions in the context of a message
	// Returns true if the action is allowed
	async check_permission(message)
	{
		function is_match(id, rule)
		{
			if (Array.isArray(rule))
				return rule.includes(id);

			return (rule == '*' || rule == id);
		}

		function is_role_match(roles, rule)
		{
			if (Array.isArray(rule))
				return rule.find(e => roles.has(e));

			return roles.has(rule);
		}

		let command_name = this.name;

		let user_id = message.author.id;
		let channel_id = message.channel.id;
		let channel_type = message.channel.type;

		let is_guild = message.channel.type == 'text';
		if (is_guild)
		{
			var owner = message.guild.ownerID;
			var guild_id = message.guild.id;

			// Invisible users aren't always cached and we need to explicitly fetch them
			if (!message.member)
			{
				message.member = await message.guild.fetchMember(message.author);
			}
			var roles = message.member.roles;
			var custom_rules = await message.guild.config.get('permissions');
		}

		// Flatten parameters into an array of single rules
		// Rules are evaluated in ascending order, the first rule that matches decides the result
		// If no rules match, the default is to allow
		let rules = [].concat(
			// Global rules
			this.client.permissions,
			// Command specific rules
			this.permissions,
			// Guild leader rules
			await custom_rules || []
		);

		// Find the first matching rule
		let match = rules.find(function(rule) {
			// TODO: Aliases
			if (rule.command && !(rule.command == '*' || rule.command == command_name))
				return; // Wrong command

			if (!is_guild && (rule.guild || rule.role || rule.not_leader || rule.leader || rule.not_guild || rule.not_role))
				return; // This rule is only for guilds

			if (rule.guild && !is_match(guild_id, rule.guild))
				return; // Wrong guild

			if (rule.not_guild && is_match(guild_id, rule.guild))
				return;

			if (rule.channel && !is_match(channel_id, rule.channel))
				return;	// Wrong channel

			if (rule.not_channel && is_match(channel_id, rule.not_channel))
				return;

			if (rule.user && !is_match(user_id, rule.user))
				return;	// Wrong user

			if (rule.not_user && is_match(user_id, rule.not_user))
				return;

			if (rule.role && !is_role_match(roles, rule.role))
				return;	// Wrong role

			if (rule.not_role && is_role_match(roles, rule.not_role))
				return;

			if (rule.channel_type && !is_match(channel_type, rule.channel_type))
				return; // Wrong channel_type

			if (rule.leader && user_id != owner)
				return;

			if (rule.not_leader && user_id == owner)
				return;

			return true;
		});

		// If a match was found and has block or allow, use the rule to decide
		if (match && typeof match.block === 'boolean')
			return !match.block;
		if (match && typeof match.allow === 'boolean')
			return match.allow;

		// Default: Allow
		return true;
	}

	// Internal: Called after the command is first created, to load asynchronous data
	async _init()
	{
		// Load stats
		try
		{
			let commandstats = await this.client.config.get('commandstats');
			if (commandstats && commandstats[this.name])
			{
				this.use_count = commandstats[this.name].use_count;
				this.err_count = commandstats[this.name].err_count;
			}
		}
		catch(err)
		{
			console.warn(err);
		}

		// If the user passed an init function, call it
		if (typeof this.init === 'function')
			await this.init();
	}

	// Internal: Saves usage statistics
	async _save_usage(hr_start_time, error)
	{
		this.use_count += 1;
		if (error)
			this.err_count += 1;

		// Calculate elapsed time and push it into the recent timings array
		let timediff = process.hrtime(hr_start_time);
		this.timings.push(timediff[0] * 1000 + timediff[1] / 1000000);

		// Clear the oldest time if we have too many times saved
		if (this.timings.length > 10)
			this.timings.shift();

		try
		{
			// Load or create commandstats object
			let commandstats = await this.client.config.get('commandstats') || {};

			// Update statistics
			commandstats[this.name] = {
				use_count: this.use_count,
				err_count: this.err_count
			};

			// Save it
			await this.client.config.set('commandstats', commandstats);
		}
		catch(err)
		{
			console.warn(err);
		}
	}
}

module.exports = Command;
