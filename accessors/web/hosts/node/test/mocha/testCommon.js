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

// Is nodeHost used anywhere?  nodeHostInvoke loads nodeHost as commonHost.
var nodeHost = require('../../nodeHost.js');

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
