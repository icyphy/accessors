// Copyright (c) 2017 The Regents of the University of California.
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
 * Calculate maps of accessors to test cases and accessors to hosts,
 * by examining the contents of the accessors repository.
 * 
 * Requires the glob package:
 *
 * npm install -g glob
 *
 * See https://github.com/isaacs/node-glob
 *
 * To run:
 * (cd accessors/web; node reports/status/calculateAccessorMap.js)
 * which creates reports/status/accessorMap.txt 
 *
 * See
 * https://www.icyphy.org/accessors/wiki/Notes/Status#Automating
 *
 * @module accessorMap
 *
 * @author Beth Osyk, contributor: Christopher Brooks
 * @version: $$Id$$
 */

var fs = require('fs');
var glob = require('glob');

// To run, invoke calculate().  Must be run from /accessors/web
module.exports = (function () {

    var baseDir = "./node_modules/@accessors-hosts";
    // The contents of the resultsFile is the string representation of
    // a JSON object with two keys, the value of the testToAccessors
    // variable and the value of the accessorsToHosts variables below.
    var resultsFile = "./reports/status/accessorMap.txt";

    // testsToAccessors is a JSON object with the test file name (with
    // the .xml) followed by an array of accessors without the .js.
    // For example:
    // {"testToAccessors":{"gdp/test/auto/GDPLogCreateAppendRead.jsl":["gdp/GDPLogRead","gdp/GDPLogCreate"] ...
    var testsToAccessors = {};
    var testsError = [];
    var accessorsToModules = {};
    var accessorsError = [];
    var accessorExtends = {};
    var hostsToModules = {};
    var hostsError = [];

    var testcases = [];
    var accessors = [];
    
    /** calculate() determines the set of accessors that are fully functional
     *  on each host.
     *  This is a three-step process.  The steps are independent; any ordering 
     *  is fine.
     *  
     *  1) Determine the modules supported by each host.
     *  
     *  2) Determine the modules required by each accessor.  
     *     Now we know the accessors supported by each host.
     *     
     *  3) Determine the accessors used by each test case.  
     *     This gives which accessors are fully functional on each host.
     */
    var calculate = function() {
        findAccessors();
        findTestCases();
        
        // Host to modules:
        // Scan hosts/**/modules and node_modules subdirectories 
        // to ascertain supported modules.
        // So far, only browser and node offer additional modules.
        // hosts/browser/modules
        // hosts/common/modules (these are therefore supported by all hosts).
        // hosts/node/node_modules may include locally-installed modules.
        scanHosts(baseDir);
    };
    
    /** Check results objects for number of keys equal to expected length.
     * fs.readFile() doesn't return a promise, so can't wait on set of promises.
     */
    var checkIfDone = function() {
        // Assume at least one test case.  Array may not be populated before 
        // this is checked.

        // console.log('accessorMap.js: checkIfDone(): Object.keys(testsToAccessors).length: ' +
        //             Object.keys(testsToAccessors).length +
        //             ' ' + (testcases.length - testsError.length)  +
        //             ' ' + (testcases.length > 0)
        //            );
        if (Object.keys(testsToAccessors).length === (testcases.length - testsError.length) && 
            testcases.length > 0) {


            if (Object.keys(accessorsToModules).length === 
                (accessors.length - accessorsError.length)) {
                
                // Calculate modules from superclass accessors.
                for (var accessor in accessorExtends) {
                    if (accessorExtends[accessor].length > 0) {
                        accessorExtends[accessor].forEach(function(superclass) {
                            var modules = accessorsToModules[superclass + ".js"];
                            if (typeof modules === 'undefined') {
                                console.log("checkIfDone(); accessorsToModules[" + superclass + "\".js\"] returned undefined?");
                            } else {
                                if (modules.length > 0) {
                                    modules.forEach(function(module) {
                                        accessorsToModules[accessor].push(module);
                                    });
                                }
                            }
                        });
                    }
                }

                // Calculate accessors to hosts.

                // accessorsToHosts is a JSON variable where each
                // accessor is followed by an array containing the
                // names of the hosts that implement it

                // For example: "accessorsToHosts":{"audio/AudioPlayer.js":["browser"],

                var accessorsToHosts = {};
                var hosts, modules, hasAllModules;
                
                for(var accessor in accessorsToModules) {
                    hosts = [];
                    
                    modules = accessorsToModules[accessor];
                    if (modules !== null && typeof modules !== 'undefined') {
                        if(modules.length > 0) {
                            for (var host in hostsToModules) {
                                hasAllModules = true;

                                modules.forEach(function(module) {
                                    hostsToModules[host].includes(module)
                                    if (!hostsToModules[host].includes(module) && 
                                        !hostsToModules.common.includes(module)) {
                                        hasAllModules = false;
                                    }
                                });
                                
                                if (hasAllModules) {
                                    hosts.push(host);
                                }
                            }
                            
                            accessorsToHosts[accessor] = hosts;
                        } else {
                            // Accessors with no modules are supported by all.
                            accessorsToHosts[accessor] = ['all'];
                        }
                    } 
                }
                
                var results = {};
                results.testsToAccessors = testsToAccessors;
                results.accessorsToHosts = accessorsToHosts;
                
                fs.writeFile(resultsFile, JSON.stringify(results), 'utf8', function(err) {
                    if (err) {
                        console.log('Error writing results file: ' + err);
                    }
                });
                console.log('accessorMap.js: checkIfDone(): wrote ' + resultsFile);

            }
        }
    }

    /** Find all accessor source files.
     */
    var findAccessors = function(){
        // Find *.js files not in /test/auto or in any excluded directory.
        glob('!(demo|hosts|jsdoc|library|obsolete|reports|styles|wiki)**/*.js', function(err, files) {
            accessors = files;        // So we can check all finished later.
            
            console.log('accessorMap.js: findAccessors(): found ' + accessors.length + ' possible accessor files.');

            // Accessors to modules:
            // Any file not under a /test/auto directory with a .js extension.
            // Look for require() statements.
            files.forEach(function(filepath) {
                scanAccessorFile(filepath);
            });

        });
    };
    
    /** Find all *.js files under test/auto and 
     *  As a side effect, this function sets the testcases global variable to the results.   
     */
    var findTestCases = function(){
        // Test cases to accessors:
        // Any file under a /test/auto directory with a .js extension.
    	// Exclude /hosts/cordova and node_modules/@accessors-hosts/cordova 
    	 // as each demo includes all of the accessors 
    	// repo, plus there may be symbolic links to restricted access 
    	// directories which will throw an EACCES exception.  Also, there
    	// isn't a regression test suite available yet for cordova, so there
    	// are no test results.
        glob('!(node_modules)/!(cordova)/**/*.js', function(err, files) {
        	//glob('**/*.js', function(err, files) {
            testcases = [];
            
            if (files !== null && typeof files !== 'undefined') {
	            files.forEach(function(filepath) {
	            	console.log(filepath);
	                if (filepath.indexOf('test/auto') !== -1) {
	                    scanTestcase(filepath);
	                    testcases.push(filepath);
	                }
	            });
	            console.log('accessorMap.js: findTestCases(): found ' + testcases.length + ' test/auto/** *.js testcase files.');
            }
        });
    };
    
    /** Record the names of required modules in the given accessor source file.
     * @param filepath The path to the accessor source file.
     */
    var scanAccessorFile = function(filepath) {
        
        fs.stat(filepath, function(err, stats) {
            if (err) {
                console.log(filepath + ' not found.');
                accessorsError.push(filepath);

            } else {
                if (!stats.isFile()) {
                    console.log('accessorMap.js: Skipping ' + filepath + ' because it is not a file.');
                } else {
                    fs.readFile(filepath, 'utf8', function(err, data) {
                        if (err) {
                            console.log('accessorMap.js: Error reading file ' + filepath + " : " + err);
                            console.log(stats);
                            accessorsError.push(filepath);
                        } else {
                            
                            // Extract accessor name from filename. 
                            // Filepath is the full platform-dependent path.
                            // Extract part after */accessors/web/
                            var i = filepath.indexOf('accessors/web');
                            if (i >= 0) {
                                filepath = filepath.substring(i + 14);
                            }
                            accessorsToModules[filepath] = [];
                            accessorExtends[filepath] = [];
                            
                            // Look for matches to:
                            // extend('package/accessor') where quotes may be double 
                            // quotes or single quotes.  Ignore whitespace.
                            // This will return, for example:
                            // extend('net/TCPSocketClient'
                            // Use /g at the end to find all matches.
                            var exp = /extend\(\s*['"]\s*\w+\/\w+\s*['"]/g; 
                            var matches = data.match(exp);
                            
                            if (matches !== null && typeof matches !== 'undefined' &&
                                matches.length > 0) {
                                matches.forEach(function(match) {
                                    // Module name is from ' or " to end-1
                                    var quote = match.indexOf('\'');
                                    if (quote < 0) {
                                        quote = match.indexOf('\"');
                                    }
                                    if (quote >= 0) {
                                        match = match.substring(quote + 1, match.length - 1);
                                    }

                                    accessorExtends[filepath].push(match);
                                });
                            }
                            
                            // Look for matches to:
                            // require('something') where quotes may be double 
                            // quotes or single quotes.  Ignore whitespace.
                            // This will return, for example:
                            // require('cameras'
                            // Use /g at the end to find all matches.
                            var exp = /require\(\s*['"]\s*-*\w+-*\w*\s*['"]/g;
                            
                            var matches = data.match(exp);
                            
                            // Some accessors do not require any modules.
                            if (matches !== null && typeof matches !== 'undefined' &&
                                matches.length > 0) {
                                matches.forEach(function(match) {
                                    // Module name is from ' or " to end-1
                                    var quote = match.indexOf('\'');
                                    if (quote < 0) {
                                        quote = match.indexOf('\"');
                                    }
                                    if (quote >= 0) {
                                        match = match.substring(quote + 1, match.length - 1);
                                    }

                                    accessorsToModules[filepath].push(match);
                                });
                            }
                        }
                    });
                }
            }
        });
        checkIfDone();
    };
    
    /** Scan the given directory for all subdirectories.  These subdirectories
     *  are the hosts.  Then, scan each host directory for modules.  Any *.js 
     *  file or subdirectory is considered a module.  Store results in 
     *  hostsToModules object.
     *  @param baseDir The directory containing host subdirectories.  
     */
    var scanHosts = function(baseDir) {
        
        try {
            var hostDirs = fs.readdirSync(baseDir);
            
            hostDirs.forEach(function(dir) {
                // Use synchronous calls to avoid hard-coding the number of 
                // hosts and waiting for that many results.
                try {
                    var stats = fs.statSync(baseDir + "/" + dir);
                    
                    if (stats !== null && typeof stats !== 'undefined' && 
                        stats.isDirectory()) {
                        
                        var modules = null;
                        var modulesDir = dir + "/modules";
                        // node uses node_modules .
                        if (dir === 'node') {
                            modulesDir = dir + "/node_modules";
                        }
                        
                        try {
                            var dirStats = fs.statSync(baseDir + "/" + modulesDir);
                            if (dirStats !== null && typeof dirStats !== 'undefined' && 
                                dirStats.isDirectory()) {
                                modules = fs.readdirSync(baseDir + "/" + modulesDir);
                            }
                        } catch(err){
                            // modules subdirectory does not yet exist for 
                            // all hosts.
                        }
                        
                        hostsToModules[dir] = [];

                        if (modules !== null && typeof modules !== 'undefined') {
                            // Modules are any *.js file or directory.
                            var module;
                            
                            for (var i = 0; i < modules.length; i++) {
                                module = modules[i];
                                try {
                                    var moduleStats = 
                                        fs.statSync(baseDir + "/" + modulesDir + "/" + module);
                                    if (moduleStats !== null && 
                                        moduleStats !== 'undefined' &&
                                        moduleStats.isDirectory()) {
                                        hostsToModules[dir].push(module);
                                    } else if (module.indexOf('.js') > 0 && 
                                               module.indexOf('.js') === module.length - 3) {
                                        hostsToModules[dir].push(module.substring(0, module.length - 3));
                                    }
                                } catch(err) {
                                    console.log('Error processing module ' + module);
                                }
                            }
                        } 
                    }
                } catch(err) {
                    console.log('Error tabulating modules for ' + dir);
                    hostsError.push(dir);
                }
            }); 
        } catch(err) {
            console.log('Error tabulating modules.  Cannot read hosts directory.');
        }
        
        // Add native node modules.
        if (hostsToModules.node !== null && 
            typeof hostsToModules.node !== 'undefined') {
            hostsToModules.node.push('querystring');
        }
        
        for (var module in hostsToModules) {
            if (hostsToModules.hasOwnProperty(module)) {
                console.log('accessorMap.js: scanHosts(): found ' + hostsToModules[module].length + ' ' + module + ' modules.');
            }
        }

        checkIfDone();
    };

    /** Record the names of accessors used in the given test file.
     *  @param The path to the test file. 
     */
    var scanTestcase = function(filepath) {
        
        fs.stat(filepath, function(err, stats) {
            if (err) {
                // Record not-found test cases in a "failed" table.
                console.log(filepath + ' not found.');
                testsError.push(filepath);
            } else {
                fs.readFile(filepath, 'utf8', function(err, data) {
                    if (err) {
                        console.log('Error reading file ' + filepath + " : " + err);
                        testsError.push(filepath);
                    } else {
                        
                        // Look for a match to:
                        // instantiate('something', 'dir/its/in/accessorName where quotes may
                        // be double quotes or single quotes.  Ignore whitespace.
                        // This will return, for example:
                        // instantiate('TestDisplay', 'test/testDisplay
                        // The g on the end of exp instructs to return all matches.
                        var exp = /instantiate\(\s*['"]\s*\w+\s*['"]\s*,\s*['"]\s*[\w\/\\]+/g;
                        
                        var matches = data.match(exp);
                        
                        if (matches !== null && typeof matches !== 'undefined' &&
                            matches.length > 0) {
                            if (!testsToAccessors.hasOwnProperty(filepath)) {
                                testsToAccessors[filepath] = [];
                            }
                            
                            matches.forEach(function(match) {
                                // Accessor name is everything following last ' or "
                                var quote = match.lastIndexOf('\'');
                                if (quote < 0) {
                                    quote = match.lastIndexOf('\"');
                                }
                                if (quote >= 0) {
                                    match = match.substring(quote + 1);
                                }
                                
                                // Filepath is the full platform-dependent path.
                                // Extract part after */accessors/web/
                                var prefix = filepath.indexOf('accessors/web/');
                                if (prefix >= 0) {
                                    filepath = filepath.substring(prefix + 14);
                                }

                                // console.log('accessorMap.js: scanTestcase(): ' + ' filepath: ' + filepath + ' match: ' + match);

                                testsToAccessors[filepath].push(match);
                            });
                        } else {
                            console.log('accessorMap.js: scanTestCase(): Warning: no accessors found in ' +
                                        filepath);
                            testsError.push(filepath);
                        }
                        
                        checkIfDone();
                    }
                });
            }
        });
        
        checkIfDone();
    };
    
    return {
        calculate: calculate
    };
})();

