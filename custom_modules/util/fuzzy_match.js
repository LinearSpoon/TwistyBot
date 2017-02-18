module.exports = function(needle, haystack, weights)
{
	if (!weights)
		weights = {};

	if (!weights.delete) weights.delete = 20;
	if (!weights.insert) weights.insert = 7;
	if (!weights.multiple_insert) weights.multiple_insert = 1;
	if (!weights.substitution) weights.substitution = 8;
	if (!weights.typo_distance) weights.typo_distance = 4;
	if (!weights.transpose) weights.transpose = 10;

	for(var z in haystack)
	{
		haystack[z] = { name: haystack[z], score: calculate_score(needle, haystack[z], weights) };
	}
	haystack.sort( (a,b) => a.score - b.score );
	//console.old(haystack);

	return haystack;
};


function calculate_score(a, b, weights)
{
	if (typeof a !== 'string') a = "";
	if (typeof b !== 'string') b = "";

	a = a.toLowerCase(); b = b.toLowerCase();

	if (a == '') // The only solution is to insert every character of b into a
		return weights.insert + weights.multiple_insert * (b.length - 1);

	if (b == '') // The only solution is to delete every character of a
		return weights.delete * a.length;

	// Temporary variables holding scores for different methods
	var w1, w2, w3, w4;

	// Initialize corner

	var score_mat = [];
	var insert_mat = [[ false ]];
	if (a[0] == b[0])
	{
		score_mat.push([ 0 ]);
	}
	else
	{ // Choose best of insert+delete or substitute
		score_mat.push([ Math.min(
			weights.delete + weights.insert,
			weights.substitution + weights.typo_distance * kbd_distance(a[0], b[0])
		) ]);
	}

	// Init left column
	for(var y = 1; y < b.length; y++)
	{
		// use previous replace and insert this
		w1 = score_mat[0][y-1] + (insert_mat[0][y-1] ? weights.multiple_insert : weights.insert);
		// insert all previous
		w2 = weights.insert + weights.multiple_insert * (y-1);
		if (a[0] != b[y])
		{
			w2 += Math.min(weights.delete + weights.insert, // delete and insert this
				weights.substitution + weights.typo_distance * kbd_distance(a[0], b[y])); // substitute this
			//w2 += weights.delete + weights.insert;
		}
		if (w1 < w2)
		{
			score_mat[0].push( w1 );
			insert_mat[0].push( true );
		}
		else
		{
			score_mat[0].push( w2 );
			// insert_mat[0].push( false );
		}
	}

	// begin filling
	for(var x = 1; x < a.length; x++)
	{
		// Init top row
		// use previous replace and delete this
		w1 = score_mat[x-1][0] + weights.delete;
		// delete all previous
		w2 = weights.delete * x;
		if (a[x] != b[0])
		{
			w2 += Math.min(weights.delete + weights.insert, // delete and insert this
				weights.substitution + weights.typo_distance * kbd_distance(a[x], b[0])); // substitute this
			//w2 += weights.delete + weights.insert;
		}
		score_mat.push([ Math.min(w1, w2) ]);
		insert_mat.push([]);


		for(var y = 1; y < b.length; y++)
		{
			if (a[x] == b[y])
			{ // take the match
				//insert_mat[x][y] = false;
				score_mat[x][y] = score_mat[x-1][y-1];
			}
			else
			{ // Characters don't match
				w1 = score_mat[x-1][y] + weights.delete; // delete
				w2 = score_mat[x-1][y-1] + weights.substitution + weights.typo_distance * kbd_distance(a[x], b[y]); // sub
				w3 = score_mat[x][y-1] + (insert_mat[x][y-1] ? weights.multiple_insert : weights.insert) // ins
				var result;
				if (x > 1 && y > 1 && a[x] == b[y-1] && a[x-1] == b[y])
				{ // ugly bounds check...
					w4 = score_mat[x-2][y-2] + weights.transpose; // transpose
					result = Math.min(w1, w2, w3, w4);
				}
				else
				{
					result = Math.min(w1, w2, w3);
				}

				insert_mat[x][y] = (result == w3);
				score_mat[x][y] = result;
			}
		}
	}
	//console.log(score_mat)
	return score_mat[a.length-1][b.length-1];
}



function kbd_distance(key1, key2)
{
	const keymap = {
		1:[0,0], 2:[1,0], 3:[2,0], 4:[3,0], 5:[4,0], 6:[5,0], 7:[6,0], 8:[7,0], 9:[8,0], 0:[9,0],
		q:[0,1], w:[1,1], e:[2,1], r:[3,1], t:[4,1], y:[5,1], u:[6,1], i:[7,1], o:[8,1], p:[9,1],
		a:[0,2], s:[1,2], d:[2,2], f:[3,2], g:[4,2], h:[5,2], j:[6,2], k:[7,2], l:[8,2],
		z:[0,3], x:[1,3], c:[2,3], v:[3,3], b:[4,3], n:[5,3], m:[6,3],
		' ':[4,4], '-':[4,4], '_':[4,4]
	};

	var k1 = keymap[key1];
	var k2 = keymap[key2];
	if (!k1 || !k2)
		return 50;

	return Math.abs(k2[0] - k1[0]) + Math.abs(k2[1] - k1[1]);
}
