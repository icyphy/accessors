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
});
