
// Dependencies
const http      = require('http');
const url       = require('url');


// Configuration
const port = 3000;


// The server should respond to all requests with a string
const server = http.createServer(function(req, res){

    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);     // Add true to include query URL details

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');         // clean path so /endpoint == /endpoint/

    // Send the response
    res.end('hello World\n');

    // Log the request path
    console.log('Request received on path: ', trimmedPath);
});

// Start the server, and have it listen on port 3000
server.listen(port, function() {
    console.log("The server is listing on port " + port);
});
