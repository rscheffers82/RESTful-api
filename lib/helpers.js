/*
 * Helpers for various tasks
 *
 *
 */

const crypto        = require('crypto');
const config        = require('./config');
const https         = require('https');
const querystring   = require('querystring');

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

 module.exports = helpers;