// @version: $$Id$$
// Run ../testGeoCoder.js using Mocha

// To run this test, do:
//   (cd ../../../..; ant mocha-install)
// 
//   ../../../../../node_modules/.bin/mocha  testGeoCoder.js 

var nodeHost = require('@accessors-hosts/node');
var commonHost = require('@accessors-hosts/common');

var fs = require('fs');

console.log('services/test/auto/mocha/testGeoCoder.js start');
describe('NodeHost./accessors/web/services/test/auto/mocha/testGeoCoder', function() {

    var replicationMessage = '\n\tTo replicate: (cd web/services/test/auto/mocha/; ../../../../../node_modules/.bin/mocha testGeoCoder.js)';
    console.log(replicationMessage);

    it('testGeoCoder.js', function () {

        // Run the ../../testGeoCoder.js file, which has an assert.
        var testFile = '../../testGeoCoder.js';
        if (!fs.existsSync(testFile)) {
            var originalTestFile = testFile;
            testFile = 'services/test/testGeoCoder.js';
            if (!fs.existsSync(testFile)) {
                var originalTestFile2 = testFile;
                testFile = 'org/terraswarm/accessor/accessors/web/services/test/testGeoCoder.js'
                if (!fs.existsSync(testFile)) {
                    throw new Error("Could not find " + originalTestFile + ", " + originalTestFile2 + " or " + testFile);
                }
            }
        }
        var args = ['-js', testFile];
        // nodeHost.processCommandLineArguments() terminates by
        // calling exit(), so we use
        // commonHost.processCommandLineArguments().
        commonHost.processCommandLineArguments(args,
                                             // Argument to read a file.
                                             function(filename) {
                                                 // FIXME: What if the encoding is not utf8?
                                                 return fs.readFileSync(filename, 'utf8');
                                             },
                                             // Argument to instantiate an accessor.
                                             nodeHost.instantiateTopLevel);
    });

    it('Wait 3 seconds until the geoCoder tests complete', function(done) {
        // See https://mochajs.org/#timeouts
        this.timeout(4000);
        setTimeout(function () {done(); console.log("mocha/testGeoCoder.js done");}, 3000);
    });

});
