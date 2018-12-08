
/*  
 *
 *  Primary file for API
 *  
 */ 


// Dependencies
const http              = require('http');
const url               = require('url');
const StringDecoder     = require('string_decoder').StringDecoder;

// Configuration
const port = 3000;


// The server should respond to all requests with a string
const server = http.createServer(function(req, res){

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

        // Send the response
        res.end('hello World\n');

        // Log the request path
        // console.log('Request received on path:', trimmedPath, 'with method:', method, 'with the following query string params', queryStringObject);
        // console.log('Request includes the following headers:', headers);
        console.log('Request was called with this payload: ', buffer);

    })
});

// Start the server, and have it listen on port 3000
server.listen(port, function() {
    console.log("The server is listing on port " + port);
});
