/*
 * Helpers for various tasks
 *
 *
 */

const crypto        = require('crypto');
const config        = require('./config');
const https         = require('https');
const querystring   = require('querystring');
const path          = require('path');
const fs            = require('fs');

const helpers = {};

// Create a SHA256 hash
helpers.hash = function(str) {
    if(typeof(str) === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

 // Parse a JSON string to an object in all case, without throwing
helpers.parseJsonToObject = function(str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch(err) {
        return {};
    }
};


 // Create a string with random alphanumeric characters of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const str = new Array(strLength)
            .fill(0)
            .map(char => chars[Math.floor(Math.random() * chars.length)])
            .join('');
        return str;
    } else {
        return false;
    }
};


helpers.sendTwilioSms = function(phone, msg, callback) {
    phone = typeof(phone) === 'string' && phone.trim().length === 10 ? phone.trim() : false;
    msg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg.trim() : false;
    if (phone && msg) {
        // configure the request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+1' + phone,
            'Body': msg
        };

        // Stringify the payload
        const stringPayload = querystring.stringify(payload);

        // Configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
            'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object.
        // This comes back when a the request was successful after res.end() was called.
        const req = https.request(requestDetails, function(res){
            const status = res.statusCode;
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback('Status code returned was ' + status);
            }
        });
        // Bind to the error event so it doesn't get thrown
        req.on('error', function(err) {
            callback(err);
        });

        // Add the payload
        req.write(stringPayload);

        // End / send the request
        req.end();
    } else {
        callback('Given parameters are missing or invalid');
    }
};

// Get string content of a template
helpers.getTemplate = function(templateName, data, callback) {

    templateName = typeof(templateName) === 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) === 'object' && data !== null ? data : {};

    if(templateName) {
        const templateDirectory = path.join(__dirname, '/../templates/');
        fs.readFile(templateDirectory + templateName + '.html', 'utf8', function(err, str) {
            if(!err && str && str.length > 0) {
                str = helpers.interpolate(str, data);
                callback(false, str);
            } else {
                callback('Template could not be found');
            }
        });
    } else {
        callback('A valid template name was not specified');
    }
};

// Add the universal header and footer to a string and pass provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = function(str, data, callback) {
    str = typeof(str) === 'string' && str.length > 0 ? str : '';
    data = typeof(data) === 'object' && data !== null ? data : {};

    helpers.getTemplate('_header', data, function(err, headerString) {
        if (!err && headerString) {
            helpers.getTemplate('_footer', data, function(err, footerString) {
                if (!err && footerString) {
                    const fullString = headerString + str + footerString;
                    callback(false, fullString);
                } else {
                    callback('Could not find the footer template');
                }
            });
        } else {
            callback('Could not find the header template');
        }
    });
}

helpers.interpolate = function(str, data) {
    str = typeof(str) === 'string' && str.length > 0 ? str : '';
    data = typeof(data) === 'object' && data !== null ? data : {};

    // Add the templateGlobals to the data object, prepending their key name with "global"
    for (let keyName in config.templateGlobals) {
        data['global.' + keyName] = config.templateGlobals[keyName];
    }

    // // For each key in de data object, insert its value into the string at the corresponding placeholder
    for(var key in data){
        if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){
        var replace = data[key];
        var find = '{'+key+'}';
        str = str.replace(find,replace);
        }
    }
    return str;
}

helpers.getStaticAssets = function(fileName, callback) {

    fileName = typeof(fileName) === 'string' && fileName.trim().length > 0 ? fileName.trim() : false;
    if (!fileName) {
        callback('a valid file name was not specified');
        return;
    }
    
    const publicDir = path.join(__dirname, '/../public/');
    fs.readFile(publicDir + fileName, function(err, data) {
        if (!err && data) {
            callback(false, data);
        } else {
            callback('no file could be found');
        }
    });
};

 module.exports = helpers;