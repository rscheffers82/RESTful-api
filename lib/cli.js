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
            if (uniqueInputs.includes(str.toLowerCase())) {
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