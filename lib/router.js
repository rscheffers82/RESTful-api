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
// @TODO: Only let an authenticated user access their data. They are not allowed to access data from other users.
handlers._users.get = function(data, callback) {
    const { phone } = data.queryStringObject;
    if (typeof(phone) === 'string' && phone.trim().length === 10) {
        _data.read('users', phone, function(err, data) {
            if(!err && data) {
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404, {error: 'User does not exist'});
            }
        })
    } else {
        callback(400, {error: 'Missing or invalid phone number (length needs to be 10)'});
    }
};

// Users - put
// Required data: phone
// Optional data: first_name, last_name, password (at least one must be specified for the request to be valid)
// @TODO: Only let an authenticated user update their data. They are not allowed to access data from other users.
handlers._users.put = function(data, callback) {

    const { payload } = data;
    const firstName = typeof(payload.firstName) === 'string' && payload.firstName.trim().length > 0 ? payload.firstName : false;
    const lastName = typeof(payload.lastName) === 'string' && payload.lastName.trim().length > 0 ? payload.lastName : false;
    const phone = typeof(payload.phone) === 'string' && payload.phone.trim().length === 10 ? payload.phone : false;
    const password = typeof(payload.password) === 'string' && payload.password.trim().length > 0 ? payload.password : false;

    if (phone) {
        if (firstName || lastName || password) {
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
            callback(400, {error: 'Missing fields to update'});
        }
    } else {
        callback(400, {error: 'Missing or invalid phone number (length should be 10)'});
    }
};

// Users - delete
// Required field: phone
// Optional fields: none
// @TODO: Only let authenticated users remove their details
// @TODO: remove any other data associated with the user
handlers._users.delete = function(data, callback) {
    const { phone } = data.queryStringObject;
    if (typeof(phone) === 'string' && phone.trim().length === 10) {
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
        callback(400, {error: 'Missing or invalid phone number (length needs to be 10)'});
    }
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
    'notFound': handlers.notFound,
};

module.exports = router;