### HTTP and HTTPS server that returns JSON.

This server runs on NodeJS only without the use of any additional packages other than those provided by the Node framework.

Routes available:
- `/ping`   Returns 200 status when server is up
- `/hello`  Returns a welcome message. Can be provided with a name query param to get a personalised message. e.g. `/hello/?name=Jane Do`

When no route is found a `404` status will be returned.

To run the project, clone this repo and run either:

`node index.js`

or

iOS: `NODE_ENV=production node index.js`
Windows: `set NODE_ENV=production&& node index.js`

to run the server locally in production mode.

In order to personalise the https server, create a new certificate in the https folder with the following files `cert.pem` and `key.pem`.