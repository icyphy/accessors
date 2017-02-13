// @version: $$Id$$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testCommon.js

var nodeHost = require('../../nodeHost.js');
var assert = require('assert');
describe('NodeHost./accessors/web/hosts/node/test/mocha/testCommon', function() {

    var replicationMessage = '\n\tTo replicate: (cd hosts/node/test; ../../../node_modules/.bin/mocha testCommon.js)';

    it('NodeHost./accessors/web/hosts/node/test/mocha/testCommon load testCommon', function () {
        var testCommon = require('../../../../hosts/common/test/testCommon.js');
    });

    it('Wait 3 seconds until the Spontaneous tests complete', function(done) {
        // See https://mochajs.org/#timeouts
        this.timeout(4000);
        setTimeout(function () {done(); console.log("mocha/testCommon.js done");}, 3000);
    
    });
});