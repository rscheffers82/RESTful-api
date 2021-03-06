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
const _logs         = require('./logs');
const helpers       = require('./helpers');
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
        'list users' : 'Show a list of all the registered (undeleted) users in the system',
        'more user info --{userId}' : 'Show details of a specified user',
        'list checks --up --down' : 'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
        'more check info --{checkId}' : 'Show details of a specified check',
        'list logs' : 'Show a list of all the log files available to be read (compressed only)',
        'more log info --{logFileName}' : 'Show details of a specified log file',
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

// More user info --{userId}'
cli.responders.moreUserInfo = str => {
    // Get the user ID from the string provided to us
    const dashIndex = 2 + str.indexOf('--');
    const userId = str.slice(dashIndex).trim();
    const validUserId = typeof(userId) === 'string' && userId.trim().length === 10 ? userId.trim() : false;

    cli.verticalSpace();
    if(validUserId) {
        // Read user data
        _data.read('users', validUserId, (err, userdata) => {
            if(!err && userdata) {
                delete userdata.hashedPassword;
                console.dir(userdata, { colors: true });
            }
        });
    } else {
        console.log('invalid userId provided');
    }
};


// Command: list checks --up --down
cli.responders.listChecks = str => {
    const commands = str.toLowerCase().split(' --');
    let stateToLog = ['up', 'down'];
    if (commands.includes('up') && commands.includes('down')) {
        // no action needed as this option is the default.
    } else if (commands.includes('up')) {
        stateToLog = ['up'];
    } else if (commands.includes('down')) {
        stateToLog = ['down'];
    }
    console.log(stateToLog);
    _data.list('checks', (err, checkIds) => {
        if (!err && checkIds && checkIds.length > 0) {
            cli.verticalSpace();
            checkIds.forEach(checkId => {
                _data.read('checks', checkId, (err, checkData) => {
                    if(!err && checkData) {
                        // Log the result if the status is equal to what the user specified
                        const {id, method, protocol, url, state} = checkData;
                        if(stateToLog.includes(state)) {
                            const line = `ID: ${id} ${method.toUpperCase()} ${protocol}//${url} ${state}`;
                            console.log(line);
                            cli.verticalSpace();
                        }
                    }
                });
            });
        }
    });
};

// more check info --{checkId}
cli.responders.moreCheckInfo = str => {

    // Get the check ID from the string provided to us
    const dashIndex = 2 + str.indexOf('--');
    const checkId = str.slice(dashIndex).trim();
    const validCheckId = typeof(checkId) === 'string' && checkId.trim().length === 22 ? checkId.trim() : false;

    cli.verticalSpace();
    if(validCheckId) {
        // Read user data
        _data.read('checks', validCheckId, (err, checkData) => {
            if(!err && checkData) {
                console.dir(checkData, { colors: true });
            }
        });
    } else {
        console.log('invalid checkId provided');
    }
};

// list logs
cli.responders.listLogs = () => {
    _logs.list(true, (err, logFileNames) => {
        if(!err && logFileNames && logFileNames.length > 0) {
            cli.verticalSpace();
            logFileNames.forEach(logFileName => {
                if(logFileName.includes('-')) {
                    console.log(logFileName);
                    cli.verticalSpace();
                }
            });
        }
    });
};

// more log info --{logFileName}
cli.responders.moreLogInfo = str => {
    // Get the log file name from the string provided to us
    const dashIndex = 2 + str.indexOf('--');
    const logName = str.slice(dashIndex).trim();
    const validLogName = typeof(logName) === 'string' && logName.trim().length === 36 ? logName.trim() : false;

    // y8WNbnO0c6Kx8vgqwDFmji-1547580555699

    cli.verticalSpace();
    if(validLogName) {
        // Read user data
        _logs.decompress(validLogName, (err, stringData) => {
            if(!err && stringData) {
                const logsArray = stringData.split('\n');
                logsArray.forEach(logLine => {
                    const logObject = helpers.parseJsonToObject(logLine);
                    if(logObject && JSON.stringify(logObject) !== '{}') {
                        console.dir(logObject, { colors: true });
                        cli.verticalSpace();
                    }
                });
            }
        });
    } else {
        console.log('invalid log name provided');
    }
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