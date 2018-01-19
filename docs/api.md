# TwistyBot API v1.5.2

## Table of Contents

- [class: Client](#class-client)
	* [client.add_command(options)](#client)


### class: Client

* extends: [`Discord.Client`](https://discord.js.org/#/docs/main/stable/class/Client)

#### <a name="client-add-command"></a>client.add_command(options)
- `options` <[Object]>
	- `help` <[Object]>
		- `description` <[String]> A short, one line description of the command.
		- `parameters` <[String]> Parameter usage information
		- `details` <?[String]> A longer description of the command
		- `examples` <?[Array]<[String]|[Object]>> An array of example commands and explanations
			- `params` <[String]> The example's parameters
			- `result` <[String]> The example's result
- returns: <[Promise]>


<!-- Link defines -->
[Function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[Number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[String]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[Boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"