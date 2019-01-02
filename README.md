## HTTP and HTTPS server returning JSON.

This server runs on NodeJS only without the use of any additional packages other than those provided by the Node framework.

Routes available:<br>

|Route|Description
|---|---
|`/api/users`|CRUD operations to manage users|
|`/api/tokens`|CRUD operations to manage tokens|
|`/api/checks`|CRUD operations to manage checks|
|`/`|Main index of the application|
|`/ping`|Returns 200 status when server is up|


When no route is found a `404` status will be returned.

To run the project, clone this repo and run:

`node index.js`

To run the server locally in production mode use:

iOS: `NODE_ENV=production node index.js`<br>
Windows: `set NODE_ENV=production&& node index.js`

## Create an SSL certificate for production

In order to personalise the https server, create a new certificate in the https folder with the following files `cert.pem` and `key.pem`. Instructions can be found [here](https://github.com/rscheffers82/RESTful-api/tree/master/https).

## Debugging

When debugging the server is required use the following syntax for additional information.

iOS: `NODE_DEBUG=[option] node index.js` \*<br>
Windows: `set NODE_DEBUG=[option]&&node index.js` \*

The following options are available:
- server
- workers

\* replace `[option]` with one of the above.