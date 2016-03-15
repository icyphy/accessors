// @version: $$Id$$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testNodeHostInvoke.js

var nodeHost = require('../../nodeHost.js');
describe('nodeHost instantiateAndInitialize()', function () {
    it('load testCommon', function () {
        var testArguments = ["Usually node", "Usually nodeHostInvoke.js", "test/testComposite"];
        instantiateAndInitialize(testArguments)
    });
});
