module.exports = function(needle, haystack)
{
	// Goals:
	// Start of word matches are valuable "mit", "mithril" > "scimitar"
	// trigrams?
	function d(score, source) { return {score:score, source:source}; }

	var keymap = {
		q:[0,0], w:[1,0], e:[2,0], r:[3,0], t:[4,0], y:[5,0], u:[6,0], i:[7,0], o:[8,0], p:[9,0],
		a:[0,1], s:[1,1], d:[2,1], f:[3,1], g:[4,1], h:[5,1], j:[6,1], k:[7,1], l:[8,1],
		z:[0,2], x:[1,2], c:[2,2], v:[3,2], b:[4,2], n:[5,2], m:[6,2]
	};

	function kbd_distance(key1, key2)
	{
		var k1 = keymap[key1];
		var k2 = keymap[key2];
		if (!k1 || !k2)
			return 50;

		return 5 * (Math.abs(k2[0] - k1[0]) + Math.abs(k2[1] - k1[1]));
	}

	for(var z in haystack)
	{
		var a = needle;
		var b = haystack[z];
		// initialize matrix
		var mat = [];
		if (a[0] == b[0])
			mat.push([ d(0, 'match') ]);
		else
			mat.push([ d(10, 'delete') ]);

		for(var x = 1; x < a.length; x++)
			mat.push([ d(mat[0][0].score + 20 * x, 'delete') ]);

		for(var y = 1; y < b.length; y++)
			mat[0].push( d(mat[0][0].score + 7 + y, 'insert') );

		// begin filling
		for(var x = 1; x < a.length; x++)
		{
			for(var y = 1; y < b.length; y++)
			{
				var scores = [];

				// left + 20
				scores.push( d(mat[x-1][y].score + 23, 'delete') );

				if (a[x] == b[y]) // up+left
					scores.push( d(mat[x-1][y-1].score, 'match') );
				else // up+left + 10 + keyboard distance
					scores.push( d(mat[x-1][y-1].score + 10 + kbd_distance(a[x], b[y]), 'substitution') );

				// up + 10 first, 1 following
				scores.push( d(mat[x][y-1].score + (mat[x][y-1].source == 'insert' ? 1 : 7), 'insert') );

				// up2+left2 + 10
				if (x > 1 && y > 1 && a[x] == b[y-1] && a[x-1] == b[y])
					scores.push( d(mat[x-2][y-2].score + 10, 'transpose') );

				// Compute min score
				mat[x][y] = scores.reduce( (a, b) => a.score < b.score ? a : b );
			}
		}
		haystack[z] = {name: haystack[z], score: mat[a.length-1][b.length-1].score};
		//console.log( a, '=>', b, '=', mat[a.length-1][b.length-1].score );
	}
	haystack.sort( (a,b) => a.score - b.score );
	//console.old(haystack);
	return haystack;
};
