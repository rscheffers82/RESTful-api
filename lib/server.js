/*
 * Server related tasks
 *
 */

// Dependencies
const http              = require('http');
const https             = require('https');
const fs                = require('fs');
const path              = require('path');
const StringDecoder     = require('string_decoder').StringDecoder;
const url               = require('url');

const config            = require('./config');
const helpers           = require('./helpers');
const router            = require('./router');

const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req,res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
    server.unifiedServer(req,res);
});

// Server logic for http and https
server.unifiedServer = function(req,res) {
    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);     // Add true to include query URL details

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');         // clean path so /endpoint == /endpoint/

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload is there is any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    // Collect data as it comes in, only used then a payload is specified.
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    // When the end has reached, log the response.
    // This method is always called regardless if there's a payload
    req.on('end', function() {
        buffer += decoder.end();

        // Choose the handler this request should go to
        // route not available, route to notFound
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router.notFound;
        // Construct data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer),
        };

        // Route the request to the handler as specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // Set defaults
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
            payload = typeof(payload) === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            // Send the response
            res.setHeader('content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Request response is:', statusCode, payloadString);
        });
    });
};

// Init script
server.init = function() {
    // start the http server
    server.httpServer.listen(config.httpPort, function() {
        console.log("The server is listing on port", config.httpPort, "in", config.envName, "mode");
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log("The server is listing on port", config.httpsPort, "in", config.envName, "mode");
    });

};

module.exports = server;