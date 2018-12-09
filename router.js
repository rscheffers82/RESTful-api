/*  
 *
 * Router for API
 * 
 */ 

// Define the handlers
const handlers = {};

handlers.ping = function(data, callback) {
    callback();
};

handlers.hello = function(data, callback) {
    const params = data.params;
    const message = data.queryStringObject.name 
        ? 'Hi, ' + data.queryStringObject.name + ', welcome to this awesome API'
        : 'Hi, welcome to this awesome API';
    callback(200, { data: message });
};

// Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};

const router = {
    'ping': handlers.ping,
    'hello': handlers.hello,
    'notFound': handlers.notFound,
};

module.exports = router;