/*
 * Worker-related tasks
 *
 * 
*/

// Dependencies
// const fs =      require('fs');
const http =    require('http');
const https =   require('https');
// const path =    require('path');
const url =     require('url');

const config =  require('./config');
const _data =   require('./data');
const helpers = require('./helpers');


// Instantiate workers object
const workers = {};

// Lookup all checks, get their data, send to validator
workers.gatherAllChecks = function() {
    _data.list('checks', function(err, checks) {
        if (!err && checks && checks.length > 0) {
            checks.forEach(function(check) {
                // read in the check data
                _data.read('checks', check, function(err, checkData) {
                    if(!err && checkData) {
                        // pass the result through the check validator, and let that function continue or 
                        workers.validateCheckData(checkData);
                    } else {
                        console.log('Error reading one of the check\'s data');
                    }
                })
            });
        } else {
            console.log('Could not find any checks to process');
        }
    });
};

// Sanity-checking the check-data
workers.validateCheckData = function(originalCheckData) {
    originalCheckData = typeof(originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.id) === 'string' && originalCheckData.id.trim().length === 22 ? originalCheckData.id: false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) === 'string' && originalCheckData.userPhone.trim().length === 10 ? originalCheckData.userPhone: false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) === 'string' && ['http', 'https'].includes(originalCheckData.protocol) ? originalCheckData.protocol: false;
    originalCheckData.url = typeof(originalCheckData.url) === 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url: false;
    originalCheckData.method = typeof(originalCheckData.method) === 'string' && ['get', 'post', 'put', 'delete'].includes(originalCheckData.method) ? originalCheckData.method: false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) === 'object'
        && originalCheckData.successCodes instanceof Array
        && originalCheckData.successCodes.length > 0 
            ? originalCheckData.successCodes: false;
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) === 'number'
    && originalCheckData.timeoutSeconds % 1 === 0
    && originalCheckData.timeoutSeconds >= 1
    && originalCheckData.timeoutSeconds <=5
        ? originalCheckData.timeoutSeconds: false;

    // Add the keys that may not be set (if the workers have never seen this check before)
    originalCheckData.state = typeof(originalCheckData.state) === 'string' && ['up', 'down'].includes(originalCheckData.state) ? originalCheckData.state: 'down';
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

    const {id, userPhone, protocol, url, method, successCodes, timeoutSeconds} = originalCheckData;
    if (id && userPhone && protocol && url && method &&successCodes && timeoutSeconds) {
        workers.performCheck(originalCheckData);
    } else {
        console.log('One of the checks is not properly formatted. Skipping it. ID: ' + id);
    }
};

// Perform the check, send the originalCheckData and the outcome of the check process, to the next step in the process
workers.performCheck = function(originalCheckData) {
    // prepare the initial check outcome
    let checkOutcome = {
        error: false,
        responseCode: false
    };

    // mark that the outcome has not been send yet
    let outcomeSent = false;

    // parse the hostname and the path out of the original check data
    const parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
    const {hostname, pathname, search} = parsedUrl;
    const path = pathname + '?' + search;

    // construct the request
    const requestDetails = {
        protocol: originalCheckData.protocol + ':',
        hostname,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000 
    };

    // Instantiate the request object (using either the http or https module)
    const _moduleToUse = originalCheckData.protocol === 'http' ? http : https;
    const req = _moduleToUse.request(requestDetails, function(res) {
        const status = res.statusCode;

        // update the checkOutcome
        checkOutcome.responseCode = status;
        if(!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the error so it doesn't throw
    req.on('error', function(err) {
        // Update the checkOutcome
        checkOutcome.error = {
            error: true,
            value: err
        };
        if(!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the timeout event
    req.on('timeout', function(err) {
        // Update the checkOutcome
        checkOutcome.error = {
            error: true,
            value: 'timeout'
        };
        if(!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // End / send the request
    req.end();
};

// Timer to execute the worker-process once per minute
workers.loop = function() {
    setInterval(function() {
        workers.gatherAllChecks()
    }, 1000 * config.workersTimeoutInSeconds);
};

// Process the checkOutcome, update the check data as needed, trigger an alert to the user as needed
// Include special logic for a check that has never been tested before (don't alert on that)
workers.processCheckOutcome = function(originalCheckData, checkOutcome) {
    // Decide if the check is considered up or down
    const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.includes(checkOutcome.responseCode) ? 'up' : 'down';

    // Decide if an alert is warranted
    const alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state;

    // update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // Save the updates to disk
    _data.update('checks', newCheckData.id, newCheckData, function(err) {
        if(!err) {
            // Send newCheckData to the next phase in the process if needed
            if (alertWarranted) {
                workers.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Check outcome has not changed, no alert needed');
            }
        } else {
            console.log('Error trying to save newCheckData to disk');
        }
    });
};

// Function responsible for alerting the user that the status of a check has changed
workers.alertUserToStatusChange = function(newCheckData) {
    const msg = 'Alert: Your check for '
        + newCheckData.method.toUpperCase() + ' '
        + newCheckData.protocol + '://' + newCheckData.url
        + ' is currently ' + newCheckData.state + '.';
    
    helpers.sendTwilioSms(newCheckData.userPhone, msg, function(err) {
        if(!err) {
            console.log('Success: User was alerted to a status change in their check. Message sent was: "' + msg + '"');
        } else {
            console.log('Error: could not sms alert to user who had a state change in their check. Error: ', err);
        }
    });
};

// Init script
workers.init = function() {
    // Execute all the checks at start-up
    workers.gatherAllChecks();
    // Call the loop to execute checks at an interval
    workers.loop();
};

module.exports = workers;