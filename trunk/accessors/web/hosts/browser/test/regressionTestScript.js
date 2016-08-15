// Automatic test script for the browser host, using node.js execution platform.
//
// Copyright (c) 2015 The Regents of the University of California.
// All rights reserved.

// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.

// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.

// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.

/** Automatic test script for the browser host, using node.js execution platform.  
 *  This script:
 *  Starts the test server (for serving accessor files), 
 *  Loads and runs composite accessor test files, 
 *  Loads and runs Mocha test files, 
 *  And saves the result to a file.
 *  
 *  The script will search for an open port to start the test server on.
 *  This script currently requires the Firefox browser.
 *  
 *  To run, first install the selenium-webdriver module:
 *  npm install -g selenium-webdriver
 *  
 *  Then,
 *  node regressionTestScript.js
 *  
 *  The Firefox driver is installed by default.  For other browsers, install
 *  the driver and edit the script to refer to your preferred browser.
 *  NOTE:  The default driver is NOT compatible with Firefox versions 47 and up.
 *  https://www.npmjs.com/package/selenium-webdriver
 *  
 *  Results will be printed to the console, and saved at:
 *  /accessors/web/reports/junit/browserTestResults.xml
 *  
 *  For more details and examples, please see the wiki:
 *  https://www.terraswarm.org/accessors/wiki/Version0/RegressionTesting
 */

var childProcess = require('child_process');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var startPort = 8089;

/** A class for running regression tests in the browser.  This class starts a
 *  web server, starts the selenium browser driver, then runs tests in the 
 *  accessor tree.  Please see:
 *  https://www.terraswarm.org/accessors/wiki/Version0/RegressionTesting
 */
var RegressionTester = (function() {
		
	// /test/auto/mocha directories contain Mocha test files.
	// For these, a Test accessor is instantiated to load the file.
	
	// /test/auto directories contain composite accessors which
	// constitute tests.  These are instantiated and run.  Lack of 
	// exception means pass.
	
	// TODO:  Search for matching directories instead of hardcoding names.
	var resultsFilePath = "../../../reports/junit/browserTestResults.xml";
	
	var run = function(scriptPath, desiredPort) {
		
		writeResults(resultsFilePath);
	    
	}; 
	
	/** Write the results to the specified file, overwriting any existing file.
	 * 
	 * @param filepath The name and path of the file.
	 */
	var writeResults = function(filepath) {
		try {
			var writeStream = fs.createWriteStream(filepath);
			writeStream.on('open', function(){
				writeStream.write("This is a test.");
			});
			
		}
		catch(err){
			console.log("Error writing test results to " + filepath);
			console.log(err);
		}
	};
	
	return {
		run : run
	};
}());

RegressionTester.run('./testServer.js', startPort);








