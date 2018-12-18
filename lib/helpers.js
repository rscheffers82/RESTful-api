/*
 * Helpers for various tasks
 *
 *
 */

const crypto        = require('crypto');
const config        = require('./config');

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


 module.exports = helpers;