// Returns a dm channel based on the recipient name
module.exports = function(recipient) {
	// Match username and optionally a discriminator 'example#1234'
	var match = recipient.match(/([^#]+)(?:#(\d+))?/);
	var recipient_name = match[1].toLowerCase();
	var recipient_id = match[2];

	var user = this.users.find(function(user) {
		if (user.username.toLowerCase() == recipient_name)
			return (recipient_id == null || recipient_id == user.discriminator)

		return false;
	});

	if (user)
		return user.dmChannel;
};
