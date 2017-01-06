// @version: $$Id$$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha TestCommon.js
// To run all the tests, cd to the top level directory and run 'ant tests'.
// See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSMocha
var assert = require('assert');
describe('NodeHost', function() {
    // hosts/browser/common/test/mocha/testCommon.js or hosts/common/test/mocha/testCommon.js (symlink): CommonTests', function () {
    it('NodeHost./accessors/web/hosts/browser/common/test/mocha/testCommon or accessors/web/hosts/common/test/mocha/testCommon (symlink)', function () {
        // var testCommon = require('../testCommon.js');
	assert.equal(true, false, "Temporarily failing while we figure out commonHost.");
    });
});
