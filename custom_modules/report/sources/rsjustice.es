// Checks each member for RSJustice infractions
module.exports = async function(clan_list) {
	for(var i = 0; i < clan_list.length; i++)
	{
		var member = clan_list[i].rsjustice = await apis.RSJustice.lookup(member.name);
	}
	console.log('Loaded RSJustice.');
};
