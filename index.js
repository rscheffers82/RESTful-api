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
const cli       = require('./lib/cli');

const app = {};

app.init = function() {
    // start the server
    server.init();
    
    //start the workers
    workers.init();

    // Start the CLI but make sure it runs after the above two workers are started
    setTimeout(() => cli.init(), 50);
};

// execute the app
app.init();

module.exports = app;