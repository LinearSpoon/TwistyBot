var request = require('request');

request('http://services.runescape.com/m=forum/users.ws?searchname=sin+drAgon&jump=Go&lookup=find', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.
  } else {
    console.warn(error);
  }
});
