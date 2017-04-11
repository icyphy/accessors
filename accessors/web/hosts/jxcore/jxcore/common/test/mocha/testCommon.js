// @version: $$Id: testCommon.js 1304 2017-01-19 22:02:36Z cxh $$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testCommon.js
// To run all the tests, cd to the top level directory and run 'ant tests'.
// See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSMocha
var assert = require('assert');
describe('NodeHost', function() {

    it('NodeHost./accessors/web/hosts/browser/common/test/mocha/testCommon or accessors/web/hosts/common/test/mocha/testCommon (symlink)', function () {

        var testCommon = require('../testCommon.js');
    });

    it('Wait 3 seconds until the Spontaneous tests complete', function(done) {
        // See https://mochajs.org/#timeouts
        this.timeout(4000);
        setTimeout(function () {done(); console.log("mocha/testCommon.js done");}, 3000);
    
    });
   
});
