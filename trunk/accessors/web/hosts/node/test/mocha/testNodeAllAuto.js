// @version: $$Id$$
// Run the .js files accessors/web/*/test/auto/, excluding hosts/browser/test/auto
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testNodeAllAuto.js
// or
//   (cd ../../..; ant tests.mocha.composites)

var testNodeAuto = require('../testNodeAuto.js');

var fs = require('fs');

/** Find the auto directories for Node tests.
 *  hosts/browser/test/auto is excluded
 *  @return an array of auto/ directories.
 */
var findNodeAutoDirectories = function(dir) {
    var results = [];
    var files = fs.readdirSync(dir)
    files.forEach(function(file) {
            basefile = file;
            file = dir + '/' + file;
            try {
                var stat = fs.statSync(file)
                    if (stat && stat.isDirectory() && basefile != 'node_modules') {
                        // Add auto directories, but skip certain directories.
                        if (basefile == 'auto') {
                            var skipIt = false;
			    // 16-Dec-2016: Exclude gdp because GDPLogCreate is failing
                            var skipDirectories = [ 'hosts/browser/test/auto',
						    'gdp/test/auto'.
						    'node_modules/@terraswarm/gdp/test/mocha'
						  ];
                            skipDirectories.forEach(function(skipDirectory) {
                                    if (file.indexOf(skipDirectory) != -1) {
                                        console.log("testNodeAllAuto.js: Skipping " + skipDirectory);
                                        skipIt = true;
                                    }
                                });
                            if (!skipIt) {
                                results.push(file);
                            }
                        }
                        results = results.concat(findNodeAutoDirectories(file));
                    }
            } catch (e) {
                // Ignore
                //console.log("Could not read " + file + ": " + e);
            }
        });
    return results;
};

var autos = [];
try {
    // If we run this in accessors/web/hosts/node/test/mocha, then
    // search accessors/web for auto directories.
    fs.accessSync('../../nodeHost.js', fs.F_OK);

    autos = findNodeAutoDirectories('../../../..');
} catch (e) {
    try {
        // Otherwise, if we run this from $PTII, search in the accessors repo.
        fs.accessSync('./org/terraswarm/accessor/accessors/web/hosts/node/nodeHost.js', fs.F_OK);
        autos = findNodeAutoDirectories('./org/terraswarm/accessor/accessors/web');
    } catch (e) {
        // Otherwise, search in the current directory.
        autos = findNodeAutoDirectories('.');
    }
}

autos.forEach(testNodeAuto.testNodeAuto);

