// @version: $$Id$$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testNodeHost.js

var nodeHost = require('../../nodeHost.js');
var assert = require('assert');
describe('hosts/node/test/mocha/testNodeHost.js: testComposite', function () {
    describe('test/TestComposite()', function () {
        it('NodeHost.test/TestComposite: Create a test composite and run it', function () {
            var a = /*this.*/nodeHost.instantiate('TestComposite', 'test/TestComposite');
            a.initialize();
            a.provideInput('input', 10);
            a.react();
            // Should return 50
            assert.equal(a.latestOutput('output'), 50); 
            a.wrapup();
        });
    });
});
