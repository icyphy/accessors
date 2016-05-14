// @version: $$Id$$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testNodeHostInvoke.js

var nodeHost = require('../../nodeHost.js');
describe('hosts/node/test/mocha/testNodeHostInvoke.js: nodeHost instantiateAndInitialize()', function () {
    it('instantiateAndInitialize(["test/TestComposite"])', function () {
        var testArguments = ["test/TestComposite"];
        instantiateAndInitialize(testArguments);
    });
});
