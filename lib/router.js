/*  
 *
 * Router and handlers for API
 * 
 */ 

// Dependencies
const _data     = require('./data');
const helpers   = require('./helpers');

// Define the handlers
const handlers = {};

handlers.users = function(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for the users sub methods
handlers._users = {};

// Users - post
handlers._users.post = function(data, callback) {
    const { payload } = data;
    const firstName = typeof(payload.firstName) === 'string' && payload.firstName.trim().length > 0 ? payload.firstName : false;
    const lastName = typeof(payload.lastName) === 'string' && payload.lastName.trim().length > 0 ? payload.lastName : false;
    const phone = typeof(payload.phone) === 'string' && payload.phone.trim().length === 10 ? payload.phone : false;
    const password = typeof(payload.password) === 'string' && payload.password.trim().length > 0 ? payload.password : false;
    const tosAgreement = typeof(payload.tosAgreement) === 'boolean' && payload.tosAgreement === true;

    if(firstName && lastName && phone && password && tosAgreement) {
        _data.read('users', phone, function(err, data) {
            if(err) {
                // Hash the password
                const hashedPassword = helpers.hash(password);

                // Create user object
                if (hashedPassword) {
                    const userObject = {
                        firstName,
                        lastName,
                        phone, 
                        hashedPassword,
                        tosAgreement: true
                    };
    
                    // Store the user
                    _data.create('users', phone, userObject, function(err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'error': 'Could not create the new user'});
                        }
                    });    
                } else {
                    console.log(err);
                    callback(500, {error: 'Could not hash the user\'s password'});
                }
            } else {
                // User already exists
                console.log(err);
                callback(400, {error: 'A user with phone number ' + phone + ' already exists'})
            }
        });
    } else {
        callback(400, {error: 'Missing required fields'});
    }
};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = function(data, callback) {
    const { phone } = data.queryStringObject;
    if (typeof(phone) === 'string' && phone.trim().length === 10) {

        // Get the token from the headers
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, function(err, data) {
                    if(!err && data) {
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404, {error: 'User does not exist'});
                    }
                })
            } else {
                callback(403, {error: 'Missing required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400, {error: 'Missing or invalid phone number (length needs to be 10)'});
    }
};

// Users - put
// Required data: phone
// Optional data: first_name, last_name, password (at least one must be specified for the request to be valid)
handlers._users.put = function(data, callback) {

    const { payload } = data;
    const firstName = typeof(payload.firstName) === 'string' && payload.firstName.trim().length > 0 ? payload.firstName : false;
    const lastName = typeof(payload.lastName) === 'string' && payload.lastName.trim().length > 0 ? payload.lastName : false;
    const phone = typeof(payload.phone) === 'string' && payload.phone.trim().length === 10 ? payload.phone : false;
    const password = typeof(payload.password) === 'string' && payload.password.trim().length > 0 ? payload.password : false;

    if (phone) {
        if (firstName || lastName || password) {

            // Get the token from the headers
            const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

            handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
                if (tokenIsValid) {
                    // lookup the user
                    _data.read('users', phone, function(err, userData) {
                        if(!err && userData) {
                            // Update the fields.

                            if(firstName) {
                                userData.firstName = firstName;
                            }
                            if(lastName) {
                                userData.lastName = lastName;
                            }
                            if(password) {
                                userData.hashedPassword = helpers.hash(password);
                            }

                            // Store the new updates
                            _data.update('users', phone, userData, function(err){
                                if(!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {error: 'Unable to update user data'});
                                }
                            })
                        } else {
                            callback(400, {error: 'The specified user does not exist'});
                        }
                    })
                } else {
                    callback(403, {error: 'Missing required token in header, or token is invalid'});
                }
            });
        } else {
            callback(400, {error: 'Missing fields to update'});
        }
    } else {
        callback(400, {error: 'Missing or invalid phone number (length should be 10)'});
    }
};

// Users - delete
// Required field: phone
// Optional fields: none
// @TODO: remove any other data associated with the user
handlers._users.delete = function(data, callback) {
    const { phone } = data.queryStringObject;
    if (typeof(phone) === 'string' && phone.trim().length === 10) {

        // Get the token from the headers
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, function(err, data) {
                    if(!err && data) {
                        _data.delete('users', phone, function(err){
                            if(!err) {
                                callback(200);
                            } else {
                                callback(500, {error: 'Could not delete specified user'});
                            }
                        });
                    } else {
                        callback(400, {error: 'Could not find specified user'});
                    }
                })
            } else {
                callback(403, {error: 'Missing required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400, {error: 'Missing or invalid phone number (length needs to be 10)'});
    }
};


handlers.tokens = function(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
}

// container for all token methods
handlers._tokens = {};

// required data: phone, password
// optional data: none;
handlers._tokens.post = function(data, callback) {
    const {payload} = data;
    const phone = typeof(payload.phone) === 'string' && payload.phone.trim().length === 10 ? payload.phone : false;
    const password = typeof(payload.password) === 'string' && payload.password.trim().length > 0 ? payload.password : false;

    // Check if password and phone are provided and valid
    if (phone && password) {
        // Read user data
        _data.read('users', phone, function(err, userData){
            if(!err && data) {
                // Compare passwords
                if(helpers.hash(password) === userData.hashedPassword) {
                    // Valid password, create new token with expiration date (1 hour in the future);
                    const tokenId = helpers.createRandomString(22);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires,
                    };
                    // Write the token to disk
                    _data.create('tokens', tokenId, tokenObject, function(err) {
                        if(!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {error: 'Could not create new token'});
                        }
                    });
                } else {
                    callback(400, {error: 'password did not match'});
                }
            } else {
                callback(400, {error: 'Could not find the specified user'});
            }
        });
    } else {
        callback(400, {error: 'Phone or password missing or invalid'});
    }
};

// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback) {
    const { id } = data.queryStringObject;
    if (typeof(id) === 'string' && id.trim().length === 22) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if(!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, {error: 'Token does not exist'});
            }
        })
    } else {
        callback(404, {error: 'Token ID could not be found'});
    }
};

// Tokens PUT route for /tokens
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function(data, callback) {
    const {payload} = data;
    const id = typeof(payload.id) === 'string' && payload.id.trim().length === 22 ? payload.id : false;
    const extend = typeof(payload.extend) === 'boolean' && payload.extend;

    if(id && extend) {
        // Look up the token
        _data.read('tokens', id, function(err, tokenData) {
            if(!err && tokenData) {
                // Make sure the token isn't already expired
                const { expires } = tokenData;
                if (expires > Date.now()) {
                    // Set the expiration 1 hour ahead
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    _data.update('tokens', id, tokenData, function(err, newTokenData) {
                        if(!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {error: 'Unable to update token\'s expiration'})
                        }
                    });
                } else {
                    callback(400, {error: 'The token is expired and cannot be extended'});
                }
            } else {
                callback(400, {error: 'Specified token does not exist'});
            }
        });
    } else {
        callback(400, {error: 'Invalid ID or extend: true is not included. Token cannot be extended'});
    }
};

// Remove a token
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data, callback) {
    // Check that the token ID is valid
    const { id } = data.queryStringObject;
    if (typeof(id) === 'string' && id.trim().length === 22) {
        _data.read('tokens', id, function(err, data) {
            if(!err && data) {
                _data.delete('tokens', id, function(err){
                    if(!err) {
                        callback(200);
                    } else {
                        callback(500, {error: 'Could not delete specified token'});
                    }
                });
            } else {
                callback(400, {error: 'Could not find specified token'});
            }
        })
    } else {
        callback(400, {error: 'Token ID not found'});
    }
};

// Verify is a given token id is currently valid for a given user.
handlers._tokens.verifyToken = function(id, phone, callback) {
    _data.read('tokens', id, function(err, tokenData) {
        if(!err && tokenData) {
            // Check if the token is for a given user and has not expired
            if(tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};


handlers.ping = function(data, callback) {
    callback();
};

handlers.hello = function(data, callback) {
    const params = data.params;
    const message = data.queryStringObject.name 
        ? 'Hi, ' + data.queryStringObject.name + ', welcome to this awesome API'
        : 'Hi, welcome to this awesome API';
    callback(200, { data: message });
};

// Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};


// Available routes
const router = {
    'ping': handlers.ping,
    'hello': handlers.hello,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'notFound': handlers.notFound,
};

module.exports = router;