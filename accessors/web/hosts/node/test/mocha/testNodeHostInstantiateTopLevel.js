// @version: $$Id$$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testNodeHostInvoke.js

var nodeHost = require('../../nodeHost.js');
describe('NodeHost./accessors/web/hosts/node/test/mocha/testNodeHostInstantiateTopLevel nodeHost instantiateTopLevel()', function () {
    it('NodeHost./accessors/web/hosts/node/test/mocha/testNodeHostInstantiateTopLevel instantiateTopLevel()', function () {
	nodeHost.instantiateTopLevel("TestComposite", "test/TestComposite");

    });
});
