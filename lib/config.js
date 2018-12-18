/*
 * Create and export configuration variables
 *
 */

 const environment = {};

 environment.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    hashingSecret: 'stagingSecretHash256!'
 };

 environment.production = {
   httpPort: 5000,
   httpsPort: 5001,
   envName: 'production',
   hashingSecret: 'productionSecretHash512'
  };

 // Determine set environment
 const currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

 // Check if a valid environment is specified
 const environmentToExport = typeof(environment[currentEnv]) === 'object' ? environment[currentEnv] : environment.staging;

 // Export environment
 module.exports = environmentToExport;