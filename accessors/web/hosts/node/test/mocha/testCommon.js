// @version: $$Id$$
// Instantiate the test/Test accessor and provide the common host test file
// as input.
// This test requires mocha and chai.  To install these:
// sudo npm install -g mocha
// sudo npm install -g chai
//
// The test can be run using the nodeHostShell.  From this directory:
// node ../../nodeHostShell.js < ./testCommon.js
//
// Output:
//   mocha testCommon.js

// FIXME: we should not need to require nodeHost.js here.
// We must require nodeHost here if running mocha from the command
// line and running mocha from within ant is to work.
//
// From the command line:
//    cd accessors/web; mocha hosts/node/test/mocha/testCommon.js
// From ant:
//    cd accessors/web; ant tests.mocha
//
// Solution: use something similar to what is in accessors/web/hosts/common/commonHost.js
// and conditionally require nodeHost.js.
//
if (typeof process !== 'undefined' && typeof process.version === 'string') {
    var nodeHost = require('../../nodeHost.js');
}

var a = instantiate('Test', 'test/Test');
a.initialize();
a.provideInput('testFile', '../../../browser/test/test/testRunner.js');
a.react();
a.wrapup();
// try {
//     quit;
// } catch (error) {
//     console.log("testCommon.js: quit failed, this is expected under Node.");
// }
