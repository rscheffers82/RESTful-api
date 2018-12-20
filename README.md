## HTTP and HTTPS server returning JSON.

This server runs on NodeJS only without the use of any additional packages other than those provided by the Node framework.

Routes available:<br>
| Route | Description |
| --- | --- |
|`/ping` | Returns 200 status when server is up
|`/hello` | Returns a welcome message. Can be provided with a name query param to get a personalised message. e.g. `/hello/?name=Jane Do`
|`/users` | CRUD operations to manage users
|`/tokens` | CRUD operations to manage tokens
|`/checks` | CRUD operations to manage checks

When no route is found a `404` status will be returned.

To run the project, clone this repo and run:

`node index.js`

To run the server locally in production mode use:

iOS: `NODE_ENV=production node index.js`<br>
Windows: `set NODE_ENV=production&& node index.js`

## Create an SSL certificate for production

In order to personalise the https server, create a new certificate in the https folder with the following files `cert.pem` and `key.pem`. Instructions can be found [here](https://github.com/rscheffers82/RESTful-api/tree/master/https).