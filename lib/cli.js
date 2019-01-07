/*
 * CLI related admin tasks/commands
 *
 *
 */

const readline      = require('readline');
const util          = require('util');
const debug         = util.debuglog('cli');
const os            = require('os');
const v8            = require('v8');
const _data         = require('./data');
const events        = require('events');
class _events       extends events{};
const e             = new _events();

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


// ----------------------------------------
// Helper functions
// ----------------------------------------

// create a vertical space
cli.verticalSpace = lines => {
    lines = typeof(lines) === 'number' && lines.length > 0 ? lines : 1;
    for (let i=0; i < lines; i++) {
        console.log('');        // empty string will include \n\r and thus create a new line in the console
    }
};

// Create a horizontal line across the screen
cli.horizonalLine = () => {
    // Get the available screen size;
    const width = process.stdout.columns;

    const line = new Array(width).fill('-').join('');
    console.log(line);
};

// Create centered text one the screen
cli.centered = str => {
    str = typeof(str) === 'string' && str.trim().length ? str.trim() : '';

    const width = process.stdout.columns;
    const paddingLeftNum = Math.floor((width - str.length) / 2);
    const leftPadding = new Array(paddingLeftNum).fill(' ').join('');
    console.log(leftPadding + str);
};

// ----------------------------------------

// help command
cli.responders.help = () => {
    const commandsObject = {
        'exit' : 'Kill the CLI (and the rest of the application)',
        'man' : 'Show this help page',
        'help' : 'Alias of the "man" command',
        'stats' : 'Get statistics on the underlying operating system and resource utilization',
        'List users' : 'Show a list of all the registered (undeleted) users in the system',
        'More user info --{userId}' : 'Show details of a specified user',
        'List checks --up --down' : 'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
        'More check info --{checkId}' : 'Show details of a specified check',
        'List logs' : 'Show a list of all the log files available to be read (compressed and uncompressed)',
        'More log info --{logFileName}' : 'Show details of a specified log file',
      };

      // Show a header for the help page that is as wide as the screen.
      cli.horizonalLine();
      cli.centered('CLI MANUAL');
      cli.horizonalLine();
      cli.verticalSpace(2);

      const commands = Object.keys(commandsObject);
      commands.forEach(command => {
          const description = commandsObject[command];
          let line = '\x1b[33m' + command + '\x1b[0m';
          const padding = new Array(50 - line.length).fill(' ').join('');
          line += padding + description;
          console.log(line);
          cli.verticalSpace();
      });

      cli.verticalSpace(1);
      cli.horizonalLine();
};


// exit all processes with code 0, no errors occurred.
cli.responders.exit = () => process.exit(0);

// stats command
cli.responders.stats = () => {
    const allocatedHeapUsed = Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) / 100);
    const availableHeapAllocated = Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) / 100);

    const statsObject = {
        'Load average': os.loadavg().join(' '),
        'CPU count': os.cpus().length,
        'Free memory': Math.round(os.freemem() / 1024 / 1024) + ' MB',
        'Current malloced memory': v8.getHeapStatistics().malloced_memory,
        'Peak malloced memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated heap usage (%)': allocatedHeapUsed ,
        'Available heap allocated (%)': availableHeapAllocated,
        'Uptime': os.uptime() + ' seconds',
      };

      // Show a header for the help page that is as wide as the screen.
      cli.horizonalLine();
      cli.centered('SYSTEM STATISTICS');
      cli.horizonalLine();
      cli.verticalSpace(2);

      const stats = Object.keys(statsObject);
      stats.forEach(stat => {
          const description = statsObject[stat];
          let line = '\x1b[33m' + stat + '\x1b[0m';
          const padding = new Array(50 - line.length).fill(' ').join('');
          line += padding + description;
          console.log(line);
          cli.verticalSpace();
      });

      cli.verticalSpace(1);
      cli.horizonalLine();
};

cli.responders.listUsers = () => {
    _data.list('users', (err, userIds) => {
        if(!err && userIds && userIds.length > 0) {
            cli.verticalSpace();
            userIds.forEach(userId => {
                _data.read('users', userId, (err, user) => {
                    if(!err && user) {
                        const checkCount = typeof(user.checks) === 'object' && user.checks instanceof Array ? user.checks.length : 0;
                        let line = `name: ${user.firstName} ${user.lastName}, phone: ${user.phone}, checks: ${checkCount}`;
                        console.log(line);
                    }
                });
            });
        }
    });

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