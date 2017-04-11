// Copyright (c) 2016-2017 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.

/** 
 * Run the .js files in the auto/ directories.
 *
 * To run this test, do:
 *   sudo npm install -g mocha
 *   mocha testNodeAllAuto.js
 * or
 *   (cd ../../..; ant tests.mocha.composites)
 *
 * @module testNodeAllAuto
 * @author: Christopher Brooks
 * @version: $$Id$$
 */
var testNodeAuto = require('../testNodeAuto.js');

var fs = require('fs');

/** Find the auto directories for Node tests.
 *  The hosts/browser/test/auto directory is excluded.
 *  @return an array of auto/ directories.
 */
var findNodeAutoDirectories = function(dir) {
    var results = [];
    var files = fs.readdirSync(dir);
    files.forEach(function(file) {
            basefile = file;
            file = dir + '/' + file;
            try {
                var stat = fs.statSync(file);
                if (stat && stat.isDirectory() && basefile != 'node_modules') {
                        // Add auto directories, but skip certain directories.
                        if (basefile == 'auto') {
                            var skipIt = false;
                            var skipDirectories = [
                                                    'hosts/browser/test/auto',
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

for (var i = 0, length = autos.length; i < length; i++) {
    testNodeAuto.testNodeAuto(autos[i], 5000);
}

