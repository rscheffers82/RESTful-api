/*  
 *
 * Primary file for API
 *  
 * Run production mode in Windows: set NODE_ENV=production&& node index.js
 * For IOS: NODE_ENV=production node index.js
 * 
 */ 

const server    = require('./lib/server');
const workers   = require('./lib/workers');

const app = {};

app.init = function() {
    // start the server
    server.init();
    //start the workers
    workers.init();
};

// execute the app
app.init();

module.exports = app;