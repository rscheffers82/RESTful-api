/*
 * Test runner
 *
 */

// Dependencies
const helpers = require('./../lib/helpers.js');
const assert = require('assert');

// Application logic for the test runner
_app = {};

// Holder of all tests
_app.tests = {
  'unit' : {}
};

// Assert that the getNumber function is returning a number
_app.tests.unit['helpers.getNumber should return a number'] = (done) => {
  const val = helpers.getNumber();
  assert.equal(typeof(val), 'number');
  done();
};


// Assert that the getNumber function is returning 1
_app.tests.unit['helpers.getNumber should return 1'] = (done) => {
  const val = helpers.getNumber();
  assert.equal(val, 11);
  done();
};

// Assert that the getNumber function is returning 2
_app.tests.unit['helpers.getNumberOne should return 2'] = (done) => {
  const val = helpers.getNumber();
  assert.equal(val, 22);
  done();
};

// Count all the tests
_app.countTests = () => {
  let counter = 0;
  for(const key in _app.tests){
     if(_app.tests.hasOwnProperty(key)){
       const subTests = _app.tests[key];
       for(const testName in subTests){
          if(subTests.hasOwnProperty(testName)){
            counter++;
          }
       }
     }
  }
  return counter;
};

// Run all the tests, collecting the errors and successes
_app.runTests = () => {
  let errors = [];
  let successes = 0;
  let counter = 0;
  const limit = _app.countTests();

  const green = '\x1b[32m%s\x1b[0m';
  const red = '\x1b[31m%s\x1b[0m';

  for(const key in _app.tests){
     if(_app.tests.hasOwnProperty(key)){
       const subTests = _app.tests[key];
       for(const testName in subTests){
          if(subTests.hasOwnProperty(testName)){
            (function(){
              const tmpTestName = testName;
              const testValue = subTests[testName];
              // Call the test
              try{
                testValue(() => {
                  // If it calls back without throwing, then it succeeded, so log it in green
                  console.log(green,tmpTestName);

                  counter++;
                  successes++;
                  if(counter == limit){
                    _app.produceTestReport(limit,successes,errors);
                  }
                });
              } catch(e){
                // If it throws, then it failed, so capture the error thrown and log it in red
                errors.push({
                  'name' : testName,
                  'error' : e
                });

                console.log(red,tmpTestName);

                counter++;
                if(counter == limit){
                  _app.produceTestReport(limit,successes,errors);
                }
              }
            })();
          }
       }
     }
  }
};

// Product a test outcome report
_app.produceTestReport = (limit,successes,errors) => {
  console.log("");
  console.log("--------BEGIN TEST REPORT--------");
  console.log("");
  console.log("Total Tests : ",limit);
  console.log("Pass        : ",successes);
  console.log("Fail        : ",errors.length);
  console.log("");

  // If there are errors, print them in detail
  if(errors.length > 0){
    console.log("--------BEGIN ERROR DETAILS--------");
    console.log("");
    errors.forEach((testError) => {
      console.log('\x1b[31m%s\x1b[0m',testError.name);
      console.log(testError.error);
      console.log("");
    });
    console.log("");
    console.log("--------END ERROR DETAILS--------");
  }


  console.log("");
  console.log("--------END TEST REPORT--------");

};

// Run the tests
_app.runTests();