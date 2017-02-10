// Returns a user based on their username and optional descriminator
module.exports = function(recipient) {
	var match = recipient.match(/([^#]+)(?:#(\d+))?/);
	var recipient_name = match[1].toLowerCase();
	var recipient_id = match[2];

	return this.users.find(function(user) {
		if (user.username.toLowerCase() == recipient_name)
			return (recipient_id == null || recipient_id == user.discriminator)

		return false;
	});
};
