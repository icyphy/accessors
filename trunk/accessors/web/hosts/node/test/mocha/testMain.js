// @version: $$Id$$
// Exercise the accessorMain() function
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testMain.js

var nodeHost = require('../../nodeHost.js');
var accessorMain = require('../../../util/accessorMain.js');
var assert = require('assert');
describe('hosts/node/test/mocha/testMain.js: accessorMain.js accessorMain()', function () {
    it('accessorMain.accessorMain()', function () {
	var args = [];
	// 3 is the error code
	assert.equal(accessorMain.accessorMain(args), 3);
    });

    it('accessorMain.accessorMain(-h)', function () {
	var args = [ '-h' ];
	// FIXME: It would be nice to catch the output here
	assert.equal(accessorMain.accessorMain(args), 0);
    });

    it('accessorMain.accessorMain(-timeout) with no timeout', function () {
	var args = ['-timeout'];
	assert.equal(accessorMain.accessorMain(args), 3);
    });

    it('accessorMain.accessorMain(-v)', function () {
	var args = [ '-v' ];
	// FIXME: It would be nice to catch the output here
	assert.equal(accessorMain.accessorMain(args), 0);
    });


    // Run a composite accessor that has a TrainableTest accessor and check
    // that wrapup is called.
    function runTrainableTestAccessor(accessorPath) {
	it('accessorMain.accessorMain(--accessor)', function (done) {
    	    // This test is attempting to test that wrapup will get called.
    	    // The first step is to be able to get all the accessors that were created.
    	    //
    	    // One symptom of this problem is that wrapup should be called
    	    // on contained accessors.  For example,

    	    // Invoking (cd $PTII/org/terraswarm/accessor/accessors/web/hosts/node; node nodeHostInvoke.js --accessor -timeout 6000 test/auto/RampJSTest.js)
    	    // should generate:
    	    //   Reading accessor at: /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/test/auto/RampJSTest.js
    	    //   Reading accessor at: /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/test/TestSpontaneous.js
    	    //   Reading accessor at: /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/test/TrainableTest.js
    	    //   Instantiated accessor RampJSTest.js with class test/auto/RampJSTest.js
    	    //   nodeHost.js: About to invoke wrapup().
    	    //   nodeHost.js: invoking wrapup() for accessor: RampJSTest.js.TestSpontaneous
    	    //   nodeHost.js: invoking wrapup() for accessor: JavaScriptRamp
    	    //   nodeHost.js: invoking wrapup() for accessor: RampJSTest.js.TrainableTest
    	    //   TrainableTest.js: wrapup() finished: RampJSTest.js.RampJSTest.js.TrainableTest

    	    // If wrapup is not called on RameJSTest.js.TestSpontaneous, and the output ends with:
    	    //   Instantiated accessor RampJSTest.js with class test/auto/RampJSTest.js
    	    //   nodeHost.js: About to invoke wrapup().
    	    //   TrainableTest.js: wrapup() finished: RampJSTest.js.RampJSTest.js.TrainableTest

    	    // then the problem
    	    // is that we are not keeping track of accessors that are being created.
	    
            var startIndex = (accessorPath.indexOf('\\') >= 0 ? accessorPath.lastIndexOf('\\') : accessorPath.lastIndexOf('/'));
            var accessorName = accessorPath.substring(startIndex);
            if (accessorName.indexOf('\\') === 0 || accessorName.indexOf('/') === 0) {
		accessorName = accessorName.substring(1);
            }

	    this.timeout(6500);
            setTimeout(function () {
		done();
		console.log("mocha/testMain.js --accessors test " + accessorPath + " done !")

		// Assert that getTopLevelAccessors() has the RampJSTest top
		// level, the TrainableTest and that wrapup() was called.
		
		var accessor,
		    i,
		    j,
		    sawTrueWrappedUp = false,
		    topLevelAccessor;
		// FIXME: Why do we have to use getTopLevelAccessors() instead of accessors?
		// both are exported from nodeHost.js
		for (i = 0; i < nodeHost.getTopLevelAccessors().length; i += 1) {
		    topLevelAccessor = nodeHost.getTopLevelAccessors()[i];
		    console.log("mocha/testMain.js: done(): topLevelAccessor: " + topLevelAccessor);
		    if (topLevelAccessor.accessorName === accessorName) {
			// FIXME: What if there are multiple runs?
			for (j = 0; j < topLevelAccessor.containedAccessors.length; j += 1) {
			    accessor = topLevelAccessor.containedAccessors[j];
			    console.log("mocha/testMain.js: done(): accessor: " + accessor + " " + accessor.accessorName);
			    // FIXME: This is hard coding the name of
			    // the TrainableTest, we should search by
			    // class or something.
			    if (accessor.accessorName === accessorName + '.TrainableTest') {
				var util = require('util');
				if (accessor.exports.wrappedUp) {
				    var sawTrueWrappedUp = true;
				}
			    }
			}

		    }
		}
		assert.ok(sawTrueWrappedUp, "Great Scott!  It seems that wrapup() was never called in Trainable Test!  Maybe The Mummy has escaped?  Or it could be that the global list of accessors is messed up again.");
	    }, 6000);

    	    var args = [ '--accessor', '--timeout', '5500', accessorPath ];
    	    // FIXME: It would be nice to catch the output here
    	    assert.equal(accessorMain.accessorMain(args), 0);
    	    assert.ok(typeof nodeHost.getTopLevelAccessors() !== 'undefined',
    		      "nodeHost.accessors is not defined after invoking main " + args);
	});
    }

    // Run two tests to be sure that we are not exiting early.
    runTrainableTestAccessor('test/auto/RampJSTest.js');
    runTrainableTestAccessor('test/auto/RampJSTestDisplay.js');

});
