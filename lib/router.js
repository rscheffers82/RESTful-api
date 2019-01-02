/*  
 *
 * Router and handlers for API
 * 
 */ 

// Dependencies
const _data     = require('./data');
const helpers   = require('./helpers');
const config    = require('./config');

// Define the handlers
const handlers = {};


/*
 *  Frontend Handlers
 *
 */

// Index handler
handlers.index = function(data, callback) {
    if (data.method !== 'get') {
        callback(405, undefined, 'html');
        return;
    }

    // Prepare data for interpolation
    const templateData = {
        'head.title'        : 'Uptime Checker - Monitoring app by Roy Scheffers',
        'head.description'  : 'An app that offers a free service to monitor HTTP/HTTPS websites. When you site goes down you will be notified by SMS.',
        'body.class'        : 'index',
    };
    
    helpers.getTemplate('index', templateData, function(err, str) {
        if(!err && str) {
            helpers.addUniversalTemplates(str, templateData, function(err, str){
                if(!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
};

handlers.favicon = function(data, callback) {
    if (data.method !== 'get') {
        callback(405);
        return;
    }

    helpers.getStaticAssets('favicon2.ico', function(err, data) {
        if(!err && data) {
            callback(200, data, 'ico');
        } else {
            callback(500);
        }
    });
}


handlers.public = function(data, callback) {
    if (data.method !== 'get') {
        callback(500);
        return;
    }

    // Determine if the asset is within the public folder
    const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    if (trimmedAssetName.length === 0) {
        callback(404);
        return;
    }

    helpers.getStaticAssets(trimmedAssetName, function(err, data) {

        if(!err && data) {
            let contentType = 'plain';
            ['.css', '.png', '.jpg', '.ico', '.js']
                .forEach(type => trimmedAssetName.includes(type) && (contentType = type.replace('.', '')));
            callback(200, data, contentType);
        } else {
            callback(404);
        }
    });
};


handlers.accountCreate = (data, callback) => {
    if (data.method !== 'get') {
        callback(405, undefined, 'html');
        return;
    }

    // Prepare data for interpolation
    const templateData = {
        'head.title'        : 'Create an account',
        'head.description'  : 'Signup is easy and only takes a few seconds',
        'body.class'        : 'accountCreate',
    };
    
    helpers.getTemplate('accountCreate', templateData, function(err, str) {
        if(!err && str) {
            helpers.addUniversalTemplates(str, templateData, function(err, str){
                if(!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
};


// Log the user in and create a token
handlers.sessionCreate = (data, callback) => {
    if (data.method !== 'get') {
        callback(405, undefined, 'html');
        return;
    }

    // Prepare data for interpolation
    const templateData = {
        'head.title'        : 'Login to your account',
        'head.description'  : 'Please enter your phone number and password to access your account.',
        'body.class'        : 'sessionCreate',
    };
    
    helpers.getTemplate('sessionCreate', templateData, function(err, str) {
        if(!err && str) {
            helpers.addUniversalTemplates(str, templateData, function(err, str){
                if(!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
};


// Session has been deleted
handlers.sessionDeleted = (data, callback) => {
    if (data.method !== 'get') {
        callback(405, undefined, 'html');
        return;
    }

    // Prepare data for interpolation
    const templateData = {
        'head.title'        : 'Logged out',
        'head.description'  : 'You have been logged out of your account',
        'body.class'        : 'sessionDeleted',
    };
    
    helpers.getTemplate('sessionDeleted', templateData, function(err, str) {
        if(!err && str) {
            helpers.addUniversalTemplates(str, templateData, function(err, str){
                if(!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
};


// Edit an account
handlers.accountEdit = (data, callback) => {
    if (data.method !== 'get') {
        callback(405, undefined, 'html');
        return;
    }

    // Prepare data for interpolation
    const templateData = {
        'head.title'        : 'Account Settings',
        'head.description'  : '',
        'body.class'        : 'accountEdit',
    };
    
    helpers.getTemplate('accountEdit', templateData, function(err, str) {
        if(!err && str) {
            helpers.addUniversalTemplates(str, templateData, function(err, str){
                if(!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
};


// Deleted an account handler
handlers.accountDeleted = (data, callback) => {
    if (data.method !== 'get') {
        callback(405, undefined, 'html');
        return;
    }

    // Prepare data for interpolation
    const templateData = {
        'head.title'        : 'Account Deleted',
        'head.description'  : 'Your account has been deleted.',
        'body.class'        : 'accountDeleted',
    };
    
    helpers.getTemplate('accountDeleted', templateData, function(err, str) {
        if(!err && str) {
            helpers.addUniversalTemplates(str, templateData, function(err, str){
                if(!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
};


// Dashboard overview of all checks
handlers.checksList = (data, callback) => {
    if (data.method !== 'get') {
        callback(405, undefined, 'html');
        return;
    }

    // Prepare data for interpolation
    const templateData = {
        'head.title'        : 'Overview of all checks',
        'head.description'  : '',
        'body.class'        : 'checksList',
    };
    
    helpers.getTemplate('checksList', templateData, function(err, str) {
        if(!err && str) {
            helpers.addUniversalTemplates(str, templateData, function(err, str){
                if(!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
};


// Create a new check
handlers.checksCreate = (data, callback) => {
    if (data.method !== 'get') {
        callback(405, undefined, 'html');
        return;
    }

    // Prepare data for interpolation
    const templateData = {
        'head.title'        : 'Create a new check',
        'head.description'  : '',
        'body.class'        : 'checksCreate',
    };
    
    helpers.getTemplate('checksCreate', templateData, function(err, str) {
        if(!err && str) {
            helpers.addUniversalTemplates(str, templateData, function(err, str){
                if(!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
};


// Edit a check
handlers.checksEdit = (data, callback) => {
    if (data.method !== 'get') {
        callback(405, undefined, 'html');
        return;
    }

    // Prepare data for interpolation
    const templateData = {
        'head.title'        : 'Check details',
        'head.description'  : '',
        'body.class'        : 'checksEdit',
    };
    
    helpers.getTemplate('checksEdit', templateData, function(err, str) {
        if(!err && str) {
            helpers.addUniversalTemplates(str, templateData, function(err, str){
                if(!err && str) {
                    callback(200, str, 'html');
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    });
};



/*  ---------------------------------------------------------
 *
 *                  JSON API Handlers
 *
 * --------------------------------------------------------- */

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

// Users - Create a new user
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
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
        if(!firstName) {
            callback(400, {error: 'Missing required field firstName or value provided is invalid'});
        } else if (!lastName) {
            callback(400, {error: 'Missing required field lastName or value provided is invalid'});
        } else if (!phone) {
            callback(400, {error: 'Missing required field phone or value provided is invalid'});
        } else if (!password) {
            callback(400, {error: 'Missing required field password or value provided is invalid'});
        } else if (!tosAgreement) {
            callback(400, {error: 'Missing required field tosAgreement or value provided is invalid'});
        } else {
            callback(400, {error: 'Missing required fields'});
        }     
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
handlers._users.delete = function(data, callback) {
    const { phone } = data.queryStringObject;
    if (typeof(phone) === 'string' && phone.trim().length === 10) {

        // Get the token from the headers
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, function(err, userData) {
                    if(!err && userData) {
                        _data.delete('users', phone, function(err){
                            if(!err) {
                                // Delete any of the checks associated with the user
                                const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                                let checksToDelete = userChecks.length;
                                if (checksToDelete > 0) {
                                    let checksDeleted = 0;
                                    let deletionErrors = false;
                                    // Loop through each check
                                    userChecks.forEach(function(checkId) {
                                        _data.delete('checks', checkId, function(err) {
                                            if(err){
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;
                                            if(checksToDelete === checksDeleted) {
                                                if(!deletionErrors) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {error: 'Errors encountered while attempting to delete related checks. Not all checks may have been deleted'});
                                                }
                                            } 
                                        });
                                    });
                                } else {
                                    callback(200);
                                }
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
    const id = typeof(payload.id) === 'string' && payload.id.trim().length === 22 ? payload.id.trim() : false;
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


handlers.checks = function(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
}

handlers._checks = {};

// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
handlers._checks.post = function(data, callback){
    // Validate inputs
    const {payload, headers} = data;
    const protocol = typeof(payload.protocol) === 'string' && ['http', 'https'].includes(payload.protocol) ? payload.protocol : false;
    const url = typeof(payload.url) === 'string' && payload.url.trim().length > 0 ? payload.url : false;
    const method = typeof(payload.method) === 'string' && ['post', 'get', 'put', 'delete'].includes(payload.method) ? payload.method : false;
    const successCodes = typeof(payload.successCodes) === 'object'
        && payload.successCodes instanceof Array 
        && payload.successCodes.length > 0 
            ? payload.successCodes : false;
    const timeoutSeconds = typeof(payload.timeoutSeconds) === 'number'
        && payload.timeoutSeconds % 1 === 0
        && payload.timeoutSeconds >= 1
        && payload.timeoutSeconds <= 5
            ? payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // get the token from the request
        const token = typeof(headers.token) === 'string' ? headers.token : false;

        _data.read('tokens', token, function(err, tokenData) {
            if(!err && tokenData) {
                var userPhone = tokenData.phone;

                // lookup the user based on their phone number
                _data.read('users', userPhone, function(err, userData) {
                    if(!err && tokenData) {
                        const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                        
                        if(userChecks.length < config.maxChecks) {
                            const checkId = helpers.createRandomString(22);
                            const checkObject = {
                                id: checkId,
                                userPhone,
                                protocol,
                                url,
                                method,
                                successCodes,
                                timeoutSeconds,
                            };
                            // write the check to disk
                            _data.create('checks', checkId, checkObject, function(err){
                                if(!err) {
                                    // add the checkId to the user's object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // save the new user data
                                    _data.update('users', userPhone, userData, function(err) {
                                        if(!err) {
                                            callback(200, checkObject);
                                        } else {
                                            console.log(err);
                                            callback(500, {error: 'Unable to update the user with the new check'});
                                        }
                                    });
                                } else {
                                    console.log(err);
                                    callback(500, {error: 'Unable to create check'});
                                }
                            })
                        } else {
                            callback(400, {error: 'Maximum number of checks reached (' + config.maxChecks + ')'});
                        }
                    } else {
                        callback(403, {error: 'Invalid request'});
                    }
                });
            } else {
                callback(403, {error: 'Missing required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400, {error: 'Missing required inputs, or inputs are invalid'});
    }
}

// Required data: id
// Optional data: none
handlers._checks.get = function(data, callback) {
    const { id } = data.queryStringObject;
    if (typeof(id) === 'string' && id.trim().length === 22) {

        // Lookup the check
        _data.read('checks', id, function(err, checkData) {
            if(!err && checkData) {

                // Get the token from the headers
                const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    if (tokenIsValid) {
                        // If token is valid return checkData
                        callback(200, checkData);
                    } else {
                        callback(403, {error: 'Missing required token in header, or token is invalid'});
                    }
                });
            } else {
                callback(404, {error: 'Check does not exist'});
            }
        });
    } else {
        callback(400, {error: 'Missing or invalid check ID (length needs to be 22)'});
    }
};

// Required data: id
// Optional data: protocol, url, method, successCodes, timeoutSeconds (at least one must be set)
handlers._checks.put = function(data, callback) {
    // Validate inputs
    const {payload, headers} = data;
    const checkId = typeof(payload.id) === 'string' && payload.id.trim().length === 22 ? payload.id.trim() : false;
    const protocol = typeof(payload.protocol) === 'string' && ['http', 'https'].includes(payload.protocol) ? payload.protocol : false;
    const url = typeof(payload.url) === 'string' && payload.url.trim().length > 0 ? payload.url : false;
    const method = typeof(payload.method) === 'string' && ['post', 'get', 'put', 'delete'].includes(payload.method) ? payload.method : false;
    const successCodes = typeof(payload.successCodes) === 'object'
        && payload.successCodes instanceof Array 
        && payload.successCodes.length > 0 
            ? payload.successCodes : false;
    const timeoutSeconds = typeof(payload.timeoutSeconds) === 'number'
        && payload.timeoutSeconds % 1 === 0
        && payload.timeoutSeconds >= 1
        && payload.timeoutSeconds <= 5
            ? payload.timeoutSeconds : false;

    if(!checkId) {
        callback(400, {error: 'Invalid check ID provided (must be an alphanumeric string with a length of 22)'});
        return;
    }

    if (protocol || url || method || successCodes || timeoutSeconds) {
        // Get the token from the headers
        const token = typeof(headers.token) === 'string' ? headers.token : false;

        _data.read('checks', checkId, function(err, checkData){
            if(!err && checkData) {
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    if (tokenIsValid) {
                        // Update the check where necessary
                        if (protocol) {
                            checkData.protocol = protocol;
                        }
                        if (url) {
                            checkData.url = url;
                        }
                        if (method) {
                            checkData.method = method;
                        }
                        if (successCodes) {
                            checkData.successCodes = successCodes;
                        }
                        if (timeoutSeconds) {
                            checkData.timeoutSeconds = timeoutSeconds;
                        }
                        _data.update('checks', checkId, checkData, function(err) {
                            if (!err) {
                                callback(200, checkData);
                            } else {
                                callback(500, {error: 'Unable to update the check'});
                            }
                        });
                    } else {
                        callback(403, {error: 'Missing required token in header, or token is invalid'});
                    }
                });
            } else {
                callback(404, {error: 'Could not find check with ID: ' + payload.id});
            }
        });
    } else {
        callback(400, {error: 'Invalid arguments or none were provided (protocol, url, method, successCodes, timeoutSeconds)'});
    }
};

// Checks - delete
// Required field: id
// Optional fields: none
handlers._checks.delete = function(data, callback) {
    const {id} = data.queryStringObject;
    const checkId = typeof(id) === 'string' && id.trim().length === 22 ? id.trim() : false;
    if (checkId) {
        // Get the token from the headers
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

        _data.read('checks', checkId, function(err, checkData) {
            if (!err && checkData) {
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    if (tokenIsValid) {
                        // Delete the check data
                        _data.delete('checks', checkId, function(err) {
                            if (!err) {
                                // update the user object by removing the specified check from the checks array
                                _data.read('users', checkData.userPhone, function(err, userData) {
                                    if (!err && userData) {
                                        userData.checks = userData.checks.filter(check => check !== checkId);
                                        _data.update('users', checkData.userPhone, userData, function(err) {
                                            if (!err) {
                                                callback(200);
                                            } else {
                                                callback(500, {error: 'Unable to delete the check from the user'});
                                            }
                                        });
                                    } else {
                                        callback(500, {error: 'Unable to find the user who created the check, and therefor failed to remove the checks from the user object'});
                                    }
                                });
                            } else {
                                callback(500, {error: 'Unable to delete the check'});
                            }
                        });
                    } else {
                        callback(403, {error: 'Missing required token in header, or token is invalid'});
                    }   
                });     
            } else {
                callback(404, {error: 'Could not find check with ID: ' + data.queryStringObject.id});
            }
        });
    } else {
        callback(400, {error: 'Missing or invalid check ID provided (length must be 22)'});
    }
};


handlers.ping = function(data, callback) {
    callback();
};


// Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};


// Available routes
const router = {
    '': handlers.index,
    'account/create'    : handlers.accountCreate,
    'account/edit'      : handlers.accountEdit,
    'account/deleted'   : handlers.accountDeleted,
    'session/create'    : handlers.sessionCreate,
    'session/deleted'   : handlers.sessionDeleted,
    'checks/all'        : handlers.checksList,
    'checks/create'     : handlers.checksCreate,
    'checks/edit'       : handlers.checksEdit,
    'ping'              : handlers.ping,
    'api/users'         : handlers.users,
    'api/tokens'        : handlers.tokens,
    'api/checks'        : handlers.checks,
    'notFound'          : handlers.notFound,
    'public'            : handlers.public,
};

module.exports = router;