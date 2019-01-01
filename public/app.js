/*
 *  Frontend logic for the application
 */

const app = {};

// Config
app.config = {
    sessionToken: false,
};

app.client = {};

app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
    headers = typeof(headers) === 'object' && headers !== null ? headers : {};
    path = typeof(path) === 'string' ? path : '/';
    method = typeof(method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].includes(method.toUpperCase()) ? method : 'GET';
    queryStringObject = typeof(queryStringObject) === 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) === 'object' && payload !== null ? payload : {};
    callback = typeof(callback) === 'function' ? callback : false;

    headers = new Headers({
        "Content-Type": "application/json",
        ...app.config.sessionToken ? {token: app.config.sessionToken.id} : {},
        ...headers
    });
    let requestUrl = path + '?';
    let counter = 0;
    for (let queryKey in queryStringObject) {
        counter++;
        if(counter > 1) {
            requestUrl += '&';
        }
        // Add the key and value to the path
        requestUrl += `${queryKey}=${queryStringObject[queryKey]}`
    }

    const options = {
        method,
        headers,
        ...method !== 'GET' ? {body: JSON.stringify(payload)} : {}
    }

    fetch(requestUrl, options)
        // .then(res => res.json())
        .then(res => {
            const statusCode = res.status;

                    // callback if requested
                    if (callback) {
                // Acquire JSON response if available
                res.json().then(res => {
                    console.log(statusCode, res);
                        callback(statusCode, res);
                });
                }
        })
        .catch(err => {
            console.log('err', err);
        });
};