// @version: $$Id$$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testNodeHostInvoke.js

var nodeHost = require('../../nodeHost.js');
describe('hosts/node/test/mocha/testNodeHostInvoke.js: nodeHost instantiateTopLevel()', function () {
    it('nodeHost.instantiateTopLevel("TestComposite", "test/TestComposite")', function () {
	nodeHost.instantiateTopLevel("TestComposite", "test/TestComposite");

    });
});
