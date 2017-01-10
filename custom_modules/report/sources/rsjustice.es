// Checks each member for RSJustice infractions
module.exports = async function(clan_list) {
	for(var i = 0; i < clan_list.length; i++)
	{
		var results = await apis.RSJustice.lookup(member.name);
		if (results.length > 0)
			clan_list[i].rsjustice = results;
	}
	console.log('Loaded RSJustice.');
};
