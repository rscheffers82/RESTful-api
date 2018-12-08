/*
 * Create and export configuration variables
 *
 */

 const environment = {};

 environment.staging = {
    port: 3000,
    envName: 'staging',
 };

 environment.production = {
    port: 5000,
    envName: 'production',
 };

 // Determine set environment
 const currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

 // Check if a valid environment is specified
 const environmentToExport = typeof(environment[currentEnv]) === 'object' ? environment[currentEnv] : environment.staging;

 // Export environment
 module.exports = environmentToExport;