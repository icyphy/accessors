// @version: $$Id$$
// Exercise the main() function
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testMain.js

var nodeHost = require('../../nodeHost.js');
var assert = require('assert');
describe('hosts/node/test/mocha/testMain.js: commonHost.js main()', function () {

    it('main()', function () {
	var args = [];
	// 3 is the error code
	assert.equal(main(args), 3);
    });

    it('main(-h)', function () {
	var args = [ '-h' ];
	// FIXME: It would be nice to catch the output here
	assert.equal(main(args), 0);
    });

    it('main(-timeout) with no timeout', function () {
	var args = ['-timeout'];
	assert.equal(main(args), 3);
    });

    it('main(-v)', function () {
	var args = [ '-v' ];
	// FIXME: It would be nice to catch the output here
	assert.equal(main(args), 0);
    });


    // FIXME: Can't run this test because -timeout calls process.exit();
    
    // it('main(--accessor)', function () {
    // 	// This test is attempting to test that wrapup will get called.
    // 	// The first step is to be able to get all the accessors that were created.
    // 	// There are various scoping problems, it seems that the accessors variable
    // 	// needs to be defined and updated in the nodeHost module, not commonHost.
    // 	//
    // 	// One symptom of this problem is that wrapup should be called
    // 	// on contained accessors.  For example,

    // 	// Invoking (cd $PTII/org/terraswarm/accessor/accessors/web/hosts/node; node nodeHostInvoke.js --accessor -timeout 2000 test/auto/RampJSTest.js)
    // 	// should generate:
    // 	//   Reading accessor at: /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/test/auto/RampJSTest.js
    // 	//   Reading accessor at: /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/test/TestSpontaneous.js
    // 	//   Reading accessor at: /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/test/TrainableTest.js
    // 	//   Instantiated accessor RampJSTest.js with class test/auto/RampJSTest.js
    // 	//   nodeHost.js: About to invoke wrapup().
    // 	//   nodeHost.js: invoking wrapup() for accessor: RampJSTest.js.TestSpontaneous
    // 	//   nodeHost.js: invoking wrapup() for accessor: JavaScriptRamp
    // 	//   nodeHost.js: invoking wrapup() for accessor: RampJSTest.js.TrainableTest
    // 	//   TrainableTest.js: wrapup() finished: RampJSTest.js.RampJSTest.js.TrainableTest

    // 	// If wrapup is not called on RameJSTest.js.TestSpontaneous, and the output ends with:
    // 	//   Instantiated accessor RampJSTest.js with class test/auto/RampJSTest.js
    // 	//   nodeHost.js: About to invoke wrapup().
    // 	//   TrainableTest.js: wrapup() finished: RampJSTest.js.RampJSTest.js.TrainableTest

    // 	// then the problem
    // 	// is that we are not keeping track of accessors that are being created.
	
    // 	var args = [ '--accessor', '--timeout', '2000', 'test/auto/RampJSTest.js' ];
    // 	// FIXME: It would be nice to catch the output here
    // 	assert.equal(main(args), 0);
    // 	assert.ok(typeof getAccessors() !== 'undefined',
    // 		     "nodeHost.accessors is not defined after invoking main " + args);
    // });

});
