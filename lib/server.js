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
const util              = require('util');
const debug             = util.debuglog('server');

const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
    server.unifiedServer(req, res);
});

// Server logic for http and https
server.unifiedServer = function(req, res) {
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
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router.notFound;

        // When the request is within the public directory, use the public handler instead
        chosenHandler = trimmedPath.includes('public/') ? router['public'] : chosenHandler;

        // Construct data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer),
        };

        // Route the request to the handler as specified in the router
        chosenHandler(data, function(statusCode, payload, contentType) {
            // Set defaults
            contentType = typeof(contentType) === 'string' ? contentType : 'json';
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            // Return the response parts that are content specific
            let payloadString = '';
            if (contentType === 'json') {
                res.setHeader('content-type', 'application/json');
                payload = typeof(payload) === 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            }
            if (contentType === 'html') {
                res.setHeader('content-type', 'text/html');
                payloadString = typeof(payload) === 'string' ? payload : '';
            }
            if (contentType === 'css') {
                res.setHeader('content-type', 'text/css');
                payloadString = typeof(payload) !== undefined ? payload : '';
            }
            if (contentType === 'js') {
                res.setHeader('content-type', 'text/javascript');
                payloadString = typeof(payload) !== undefined ? payload : '';
            }
            if (contentType === 'ico') {
                res.setHeader('content-type', 'image/x-icon');
                payloadString = typeof(payload) !== undefined ? payload : '';
            }
            if (contentType === 'png') {
                res.setHeader('content-type', 'image/png');
                payloadString = typeof(payload) !== undefined ? payload : '';
            }
            if (contentType === 'jpg') {
                res.setHeader('content-type', 'image/jpeg');
                payloadString = typeof(payload) !== undefined ? payload : '';
            }
            if (contentType === 'plain') {
                res.setHeader('content-type', 'text/plain');
                payloadString = typeof(payload) !== undefined ? payload : '';
            }

            // Return the response parts that are common to all content-types
            res.writeHead(statusCode);
            res.end(payloadString);


            // If the response is 200, print green otherwise print red
            const green = '\x1b[32m%s\x1b[0m';
            const red = '\x1b[31m%s\x1b[0m';

            if ([200, 201].includes(statusCode)) {
                debug(green, method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            } else {
                debug(red, method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            }
        });
    });
};

// Init script
server.init = function() {
    // start the http server
    server.httpServer.listen(config.httpPort, function() {
        console.log('\x1b[36m%s\x1b[0m', "The server is listing on port " + config.httpPort, "in", config.envName, "mode");

    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log('\x1b[35m%s\x1b[0m', "The server is listing on port " + config.httpsPort, "in", config.envName, "mode");
    });

};

module.exports = server;