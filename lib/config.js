/*
 * Create and export configuration variables
 *
 */

 const environment = {};

 environment.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    hashingSecret: 'stagingSecretHash256!',
    maxChecks: 5,
   twilio: {
      'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
      'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
      'fromPhone' : '+15005550006'
     }
 };

 environment.production = {
   httpPort: 5000,
   httpsPort: 5001,
   envName: 'production',
   hashingSecret: 'productionSecretHash512',
   maxChecks: 5,
   twilio: {
      accountSid: '',
      authToken: '',
      fromPhone: ''
   }
  };

 // Determine set environment
 const currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

 // Check if a valid environment is specified
 const environmentToExport = typeof(environment[currentEnv]) === 'object' ? environment[currentEnv] : environment.staging;

 // Export environment
 module.exports = environmentToExport;