// @version: $$Id$$
// Run the .js files in just one auto directory.
//
// Example Usage:
//  (cd ../../..; mocha hosts/node/test/testNodeOneAuto.js --Dauto=net/test/auto --Dtimeout=2000)
//
// To run all the composite tests:
//  (cd ../../..; ant tests.mocha.composites)

var testNodeAuto = require('./testNodeAuto.js');

var fs = require('fs');

var auto = "";

// Default testTimeout of 500 ms.
var testTimeout = 500;

// Look fort -Dauto= and -Dtimeout=
for (var i in process.argv) {
    if (process.argv[i].indexOf('--Dauto=') === 0) {
        auto = process.argv[i].substr(8); 
    }
    if (process.argv[i].indexOf('--Dtimeout=') === 0) {
        testTimeout = process.argv[i].substr(11); 
        console.log('testNodeOneAuto.js testTimeout: ' + testTimeout);
    }
}

if (auto === "") {
    console.log("Could not find --Dauto=?  Arguments were:");
    console.log(process.argv);
} else {
    try {
        fs.accessSync(auto, fs.F_OK);
        testNodeAuto.testNodeAuto(auto, testTimeout);
    } catch (e) {
        console.log("Could not find " + auto);
    }
}
