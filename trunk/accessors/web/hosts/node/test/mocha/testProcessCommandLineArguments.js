// @version: $$Id$$
// Exercise the nodeHost.processCommandLineArguments() function
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testProcessCommandLineArguments.js

var nodeHost = require('../../nodeHost.js');
var assert = require('assert');

describe('NodeHost', function() {

    var replicationMessage = 'To replicate: (cd hosts/node/test; ../../../node_modules/.bin/mocha mocha/testProcessCommandLineArguments.js)';

    it('NodeHost./accessors/web/hosts/node/test/mocha/testProcessCommandLineArguments nodeHost.processCommandLineArguments().  Should have generated a usage message.', function () {
	assert.equal(true, false, "nodeHost.js processCommandLineArguments is not testable because it calls exit.");
    });
    
    // it('testProcessCommandLineArguments.js 1.1: nodeHost.processCommandLineArguments().  Should have generated a usage message.', function () {
    //     var args = [];
    //     // 3 is the error code
    //     assert.equal(nodeHost.processCommandLineArguments(args), false);
    // });

    // it('testProcessCommandLineArguments.js 1.2: nodeHost.processCommandLineArguments(-h). Should have generated a usage message.', function () {
    //     var args = [ '-h' ];
    //     // FIXME: It would be nice to catch the output here
    //     assert.equal(nodeHost.processCommandLineArguments(args), 0);
    // });

    // it('testProcessCommandLineArguments.js 1.3: nodeHost.processCommandLineArguments(-timeout) with no timeout. Should have generated an error message.', function () {
    //     var args = ['-timeout'];
    //     assert.equal(nodeHost.processCommandLineArguments(args), false);
    // });

    // it('testProcessCommandLineArguments.js 1.4: nodeHost.processCommandLineArguments(-v). Should have generated a version message.', function () {
    //     var args = [ '-v' ];
    //     // FIXME: It would be nice to catch the output here
    //     assert.equal(nodeHost.processCommandLineArguments(args), 0);
    // });

    // // Run a composite accessor that has a TrainableTest accessor and check
    // // that wrapup is called.
    // function runTrainableTestAccessor(accessorPath) {
    //     it('testProcessCommandLineArguments.js 2.0: nodeHost.processCommandLineArguments(' + accessorPath + ')', function (done) {
    //         // This test is attempting to test that wrapup will get called.
    //         // The first step is to be able to get all the accessors that were created.
    //         //
    //         // One symptom of this problem is that wrapup should be called
    //         // on contained accessors.  For example,

    //         // Invoking (cd $PTII/org/terraswarm/accessor/accessors/web/hosts/node; node nodeHostInvoke.js -timeout 6000 test/auto/RampJSTest)
    //         // should generate the following:
    // 	    // FIXME: The output has changed, we need to add better debugging that will print when wrapup() is called
    // 	    //
    //         //   Reading accessor at: /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/test/auto/RampJSTest.js
    //         //   Reading accessor at: /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/test/TestSpontaneous.js
    //         //   Reading accessor at: /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/test/TrainableTest.js
    //         //   Instantiated accessor RampJSTest.js with class test/auto/RampJSTest.js
    //         //   nodeHost.js: About to invoke wrapup().
    //         //   nodeHost.js: invoking wrapup() for accessor: RampJSTest.js.TestSpontaneous
    //         //   nodeHost.js: invoking wrapup() for accessor: JavaScriptRamp
    //         //   nodeHost.js: invoking wrapup() for accessor: RampJSTest.js.TrainableTest
    //         //   TrainableTest.js: wrapup() finished: RampJSTest.js.RampJSTest.js.TrainableTest

    //         // If wrapup is not called on RampJSTest.js.TestSpontaneous, and the output ends with:
    //         //   Instantiated accessor RampJSTest.js with class test/auto/RampJSTest.js
    //         //   nodeHost.js: About to invoke wrapup().
    //         //   TrainableTest.js: wrapup() finished: RampJSTest.js.RampJSTest.js.TrainableTest

    //         // then the problem
    //         // is that we are not keeping track of accessors that are being created.

    //         this.timeout(6500);
    //         setTimeout(function () {
    //             done();
    //             // console.log("mocha/testProcessCommandLineArguments.js accessors test " + accessorPath + " done !");

    //             // Assert that getTopLevelAccessors() has the RampJSTest top
    //             // level, the TrainableTest and that wrapup() was called.

    //             var sawTrueWrappedUp = false;
    //             var accessors = nodeHost.getTopLevelAccessors();
                
    //             for (var i = 0; i < accessors.length; i += 1) {
    //                 var topLevelAccessor = accessors[i];
    //                 //console.log("mocha/testProcessCommandLineArguments.js: done(): topLevelAccessor: " + topLevelAccessor.accessorName);
    //                 // FIXME: What if there are multiple runs?
    //                 for (var j = 0; j < topLevelAccessor.containedAccessors.length; j += 1) {
    //                     var accessor = topLevelAccessor.containedAccessors[j];
    //                     //console.log("mocha/testProcessCommandLineArguments.js: done(): accessor: " + accessor + " " + accessor.accessorName);
    //                     // Check that all instances of TrainableTest have been wrapped up.
    //                     // FIXME: This is hard coding the name of
    //                     // the TrainableTest actor, we should search by
    //                     // class or something.
    //                     if (accessor.accessorName.includes('.TrainableTest')) {
    //                         var util = require('util');
    //                         // The initialized property is set to false in wrapup.
    //                         // FIXME: This test will pass if the accessor was never even initialized.
    //                         // Is this OK?
    //                         if (!accessor.initialized) {
    //                             var sawTrueWrappedUp = true;
    //                         }
    //                     }
    //                 }
    //             }
    //             assert.ok(sawTrueWrappedUp, "Great Scott!  It seems that wrapup() was never called in Trainable Test!  Maybe The Mummy has escaped?  Or it could be that the global list of accessors is messed up again.");
    //         }, 6000);

    //         var args = [ '--timeout', '5500', accessorPath ];
    //         // FIXME: It would be nice to catch the output here
    //         assert.equal(nodeHost.processCommandLineArguments(args, null, nodeHost.instantiateTopLevel), true);
    //         assert.ok(typeof nodeHost.getTopLevelAccessors() !== 'undefined',
    //                 "nodeHost.accessors is not defined after invoking main " + args);
    //     });
    // }

    // // Run two tests to be sure that we are not exiting early.
    // runTrainableTestAccessor('test/auto/RampJSTest');
    // runTrainableTestAccessor('test/auto/RampJSTestDisplay');
});
