// Checks each member for RSJustice infractions
module.exports = async function(clan_list) {
	for(var i = 0; i < clan_list.length; i++)
	{
		var member = clan_list[i];
		if (apis.RSJustice.is_limited())
			continue; // Just move on I guess, we cannot delay the report for an hour
		try {
			// We don't need to delay each request here, due to caching after the first lookup
			member.rsjustice = await apis.RSJustice.lookup(member.name);
		} catch(e) {
			// Request error probably, wait a bit and retry
			console.warn('RSJ error during report: (' + member.name + ')' + e.message);
			await util.sleep(5000);
			i = i - 1;
		}
	}
	console.log('Loaded RSJustice.');
};
