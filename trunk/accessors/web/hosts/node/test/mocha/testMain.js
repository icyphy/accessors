// @version: $$Id$$
// Exercise the main() function
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testMain.js

var nodeHost = require('../../nodeHost.js');
var assert = require('assert');
describe('hosts/node/test/mocha/testMain.js: commonHost.js main()', function () {
    it('main(-h)', function () {
	var args = [];
	assert.equal(main(args), 3);
    });
    it('main(-h)', function () {
	var args = [ '-h' ];
	// FIXME: It would be nice to catch the output here
	assert.equal(main(args), 0);
    });
    it('main(-v)', function () {
	var args = [ '-v' ];
	// FIXME: It would be nice to catch the output here
	assert.equal(main(args), 0);
    });
});
