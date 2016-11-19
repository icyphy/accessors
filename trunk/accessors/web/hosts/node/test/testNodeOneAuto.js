// @version: $$Id: testNodeAuto.js 914 2016-08-22 16:00:26Z cxh $$
// Run the .js files in just one auto directory.
//
// Example Usage:
//  (cd ../../..; mocha hosts/node/test/mocha/testNodeOneAuto.js --Dauto=net/test/auto)
//
// To run all the composite tests:
//  (cd ../../..; ant tests.mocha.composites)

var testNodeAuto = require('./testNodeAuto.js');

var fs = require('fs');

var auto = "";
// Look for -Dauto=
for (var i in process.argv) {
    if (process.argv[i].indexOf('--Dauto=') === 0) {
        auto = process.argv[i].substr(8); 
        break;
    }
}

if (auto === "") {
    console.log("Could not find --Dauto=?  Arguments were:");
    console.log(process.argv);
} else {
    try {
        fs.accessSync(auto, fs.F_OK);
        testNodeAuto.testNodeAuto(auto);
    } catch (e) {
        console.log("Could not find " + auto);
    }
}
