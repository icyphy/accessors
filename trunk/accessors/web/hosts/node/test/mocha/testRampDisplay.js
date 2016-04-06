// @version: $$Id$$
// Run the test/RampDisplay code in accessors/web/test/RampDisplay.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testRampDisplay.js

var nodeHost = require('../../nodeHost.js');
describe('nodeHost instantiateAndInitialize()', function () {
    it('load testCommon', function () {
        var testArguments = ["test/RampDisplay"];
        instantiateAndInitialize(testArguments)
    });

    it('Wait 5 seconds until the Spontaneous tests complete', function(done) {
        // See https://mochajs.org/#timeouts
        this.timeout(7000);
        setTimeout(function () {done(); console.log("mocha/testCommon.js done");}, 6000);

    });

});
