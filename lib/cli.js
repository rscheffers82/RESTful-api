/*
 * CLI related admin tasks/commands
 *
 *
 */

const readline      = require('readline');
const util          = require('util');
const debug         = util.debuglog('cli');
const events        = require('events');
class _events extends events{};
const e = new _events();

const cli = {};


// Event handlers mapped to their responder function
e.on('man', function() { cli.responders.help() });
e.on('help', () => cli.responders.help());
e.on('exit', () => cli.responders.exit());
e.on('stats', () => cli.responders.stats());
e.on('list users', () => cli.responders.listUsers());
e.on('more user info', str => cli.responders.moreUserInfo(str));
e.on('list checks', str => cli.responders.listChecks(str));
e.on('more check info', str => cli.responders.moreCheckInfo(str));
e.on('list logs', () => cli.responders.listLogs());
e.on('more log info', str => cli.responders.moreLogInfo(str));


// Responders object
cli.responders = {};

cli.responders.help = () => {
    console.log('You asked for help');
};

cli.responders.exit = () => {
    console.log('You are exiting...');
};

cli.responders.stats = () => {
    console.log('You asked for stats');
};

cli.responders.listUsers = () => {
    console.log('You asked for listing users');
};

cli.responders.moreUserInfo = str => {
    console.log('You asked for more info about a user', str);
};

cli.responders.listChecks = str => {
    console.log('You asked for a list of checks', str);
};

cli.responders.moreCheckInfo = str => {
    console.log('You asked for more info about a check', str);
};

cli.responders.listLogs = () => {
    console.log('You asked for a list of all logs');
};

cli.responders.moreLogInfo = str => {
    console.log('You asked for more info about a specific log entry', str);
};


// Input processor
cli.processInput = str => {
    // Sanitize the input
    str = typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : false;

    if (str) {
        // Codify the unique strings
        const uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        let matchFound = false;
        let counter = 0;
        uniqueInputs.some(input => {
            if (str.toLowerCase().includes(input)) {
                matchFound = true;

                // Emit an event matching the unique input, and pass on the full string provided by the user.
                e.emit(input, str);
                return true;
            }
        });

        if (!matchFound) {
            // Inform the user when the command is not valid
            console.log("Command not found, try again");
        }
    }
};


 cli.init = () => {
    // Send the start message to the console in dark blue;
    const darkBlue = '\x1b[34m%s\x1b[0m';
    console.log( darkBlue, 'The CLI is running');

    // Start the interface
    const _interface = readline.createInterface({
        input   : process.stdin,
        output  : process.stdout,
        prompt  : '> ',
    });

    // Create the initial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line', str => {

        // Send input to the handler
        cli.processInput(str);

        // Re-initialize the prompt after input was handled
        _interface.prompt();

    });

    // When the user stops the CLI, stop any related processes
    _interface.on('close', () => process.exit(0));
    // 
 };


 
 module.exports = cli;