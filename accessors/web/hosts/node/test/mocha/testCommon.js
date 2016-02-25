// @version: $$Id$$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testCommon.js

var nodeHost = require('../../nodeHost.js');
var assert = require('assert');
describe('testCommon', function () {
    it('load testCommon', function () {
        var testCommon = require('../../../../hosts/common/test/testCommon.js');
    });
});
