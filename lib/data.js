/*
 * Library for storing and editing data
 *
 *
*/

// Dependencies
const fs        = require('fs');
const path      = require('path');
const helpers   = require('./helpers');

const lib = {};

lib.baseDir = path.join(__dirname, '../.data/');

// Create a new file
lib.create = function(dir, file, data, callback) {
    // Open the file for writing
    const filePath = lib.baseDir + dir + '/' + file + '.json';
    fs.open(filePath, 'wx', function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err) {
                if(!err){
                    fs.close(fileDescriptor, function(err) {
                        if(!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file')
                        }
                    })
                } else {
                    callback('Error writing to new file');
                }
            });
        } else {
            callback('Could not create new file, it may already exist');
        }
    });
};

// Read data from a file
lib.read = function(dir, file, callback) {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err, data){
        if(!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

lib.update = function(dir, file, data, callback){
    //Open the file for writing
    const filePath = lib.baseDir + dir + '/' + file + '.json';
    fs.open(filePath, 'r+', function(err, fileDescriptor){
        if(!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            // Truncate the file
            fs.truncate(fileDescriptor, function(err) {
                if(!err) {
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, function(err){
                        if (!err) {
                            fs.close(fileDescriptor, function(err){
                                if(!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing existing file')
                                }
                            });
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback('Could not open the file for updating, it may not exist yet');
        }
    });
}

lib.delete = function(dir, file, callback){
    // Unlink the file
    const filePath = lib.baseDir + dir + '/' + file + '.json';

    fs.unlink(filePath, function(err) {
        if(!err) {
            callback(false);
        } else {
            callback('Error removing file: ' + file);
        }
    });
};

module.exports = lib;