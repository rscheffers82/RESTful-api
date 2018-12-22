/*
 * Library for storing and rotating logs
 *
 * 
 */

// Dependencies
const fs    = require('fs');
const path  = require('path');
const zlib  = require('zlib');


const lib = {};

lib.baseDir = path.join(__dirname, '/../.logs/');

// Append a string to a file. Create the file if it does not exist
// Callback returns an error message and returns false on success
lib.append = function(file, str, callback){
    fs.open(lib.baseDir + file + '.log', 'a', function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            // Append to the file and close it
            fs.appendFile(fileDescriptor, str + '\n', function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err){
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing the log file');
                        }
                    });
                } else {
                    callback('Error appending to file');
                }
            });
        } else {
            callback('Could not open log file for appending');
        }
    });
};

// List all the logs, and optionally include all the compressed logs
lib.list = function(includeCompressedLogs, callback) {
    fs.readdir(lib.baseDir, function(err, data) {
        if (!err && data && data.length > 0) {           
            const trimmedFileNames = data.map(function(fileName) {
                if (fileName.includes('.log')) {
                    return fileName.replace('.log', '');
                }
                if (fileName.includes('.gz.b64') && includeCompressedLogs) {
                    return fileName.replace('.gz.b64', '');
                }
            }).filter(Boolean);
            callback(false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
};

// compress one .log file into a gz.b64 file within the same directory
lib.compress = function(logId, newFileId, callback) {
    const sourceFile = logId + '.log';
    const destFile = newFileId + '.gz.b64';

    fs.readFile(lib.baseDir + sourceFile, 'utf8', function(err, inputString) {
        if(!err && inputString) {
            // Compress the data using gzip
            zlib.gzip(inputString, function(err, buffer) {
                if(!err && buffer) {
                    // Open the destination file
                    fs.open(lib.baseDir+destFile, 'wx', function(err, fileDescriptor) {
                        if(!err && fileDescriptor) {
                            // Write the gzipped content to the file
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), function(err){
                                if(!err) {
                                    // Close the destination file
                                    fs.close(fileDescriptor, function(err) {
                                        if(!err) {
                                            callback(false);
                                        } else {
                                            callback(err);
                                        }
                                    });
                                } else {
                                    callback(err);
                                }
                            });
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};


// Decompress the contents of a .gz.b64 log file into a string variable
lib.decompress = function(fileId, callback) {
    const fileName = fileId + '.gz.b64';
    fs.readFile(lib.baseDir + fileName, 'utf8', function(err, str) {
        if(!err && str) {
            // Decompress the data
            const inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, function(err, outputBuffer){
                if(!err && outputBuffer) {
                    const result = outputBuffer.toString();
                    callback(false, result);
                } else {
                    callback(err);
                }    
            });
        } else {
            callback(err);
        }
    });
};


// Truncate a log file
lib.truncate = function(logId, callback) {
    fs.truncate(lib.baseDir + logId + '.log', 0, function(err) {
        if(!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};


module.exports = lib;