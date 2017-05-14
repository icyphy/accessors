// @version: $$Id$$
// Run the test/TestComposite code in accessors/web/test/TestComposite.js
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testCommon.js

var nodeHost = require('../../nodeHost.js');
var assert = require('assert');
describe('NodeHost./accessors/node_modules/@accessors-hosts/node/test/mocha/testCommon', function() {

    var replicationMessage = '\n\tTo replicate: (cd node_modules/@accessors-hosts/node/test/mocha; ../../../../../node_modules/.bin/mocha testCommon.js)';

    it('NodeHost./accessors/node_modules/@accessors-hosts/node/test/mocha/testCommon load testCommon', function () {
        var testCommon = require('@accessors-hosts/common/test/testCommon.js');
    });

    it('Wait 3 seconds until the Spontaneous tests complete', function(done) {
        // See https://mochajs.org/#timeouts
        this.timeout(4000);
        setTimeout(function () {done(); console.log("mocha/testCommon.js done");}, 3000);
    
    });
});
