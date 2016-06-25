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
 *  Starts the test server, 
 *  Opens the test web page which loads the Test accessor, 
 *  Loads a test file, 
 *  Executes the test file,  
 *  And POSTs the results back to the local server.
 *  
 *  The script will search for an open port to start the test server on.
 *  This script currently requires the Firefox browser.
 *  
 *  To run, first install the selenium-webdriver module:
 *  npm install -g selenium-webdriver
 *  
 *  Then, install the driver for your preferred browser.
 *  The Firefox driver is installed by default.  
 *  NOTE:  This driver is incompatible with Firefox versions 46 and up.
 *  Please use regressionTestScriptFirefox64.js and the setup instructions at:
 *  https://www.terraswarm.org/accessors/wiki/Version0/RegressionTesting
 *  
 *  Other browsers - please edit this script to refer to your preferred browser:
 *  https://www.npmjs.com/package/selenium-webdriver
 *  
 *  Then,
 *  node regressionTestScript.js
 *  
 *  The web server process will print results to the screen and save them at:
 *  /accessors/web/reports/junit/browserTestResults.xml
 */

var childProcess = require('child_process');
var startPort = 8089;
var maxPort = 8200;
var process;

var webdriver = require('selenium-webdriver'),
By = require('selenium-webdriver').By,
until = require('selenium-webdriver').until;

var driver = new webdriver.Builder()
	    .forBrowser('firefox')
	    .build();

runServer('./testServer.js', startPort);

/** Run the test server script, executing the given callback once the script 
 * From http://stackoverflow.com/questions/22646996/how-do-i-run-a-node-js-script-from-within-another-node-js-script
 * 
 * @param scriptPath The full path of the testServer script.
 * @param port The port to start the server on.
 */

function runServer(scriptPath, port) {
	process = childProcess.fork(scriptPath, [port]);

	// Check for port in use error.  If this happens, increment the port and
	// try again.  
	process.on('message', function(message) {		
		if (message === 'done') {
			// Quit once results have been written to a file.
			driver.quit();
			process.kill('SIGINT');
			
		} else if (message === 'listening') {
			driver.get("http://localhost:" + port + "/accessors/hosts/browser/test/test/regressionTest.html");
			
			// Wait until page has loaded
			driver.wait(function() {
				return driver.isElementPresent(By.id('reactToInputs'));
			}, 10000).then(function() {
				// Set the URL, including the port.
				driver.findElement(By.id('RegressionTest.url')).clear();
				driver.findElement(By.id('RegressionTest.url')).sendKeys('http://localhost:' + port + '/regressiontest');
				driver.findElement(By.id('reactToInputs')).click();
			});
			
		} else if (message === 'portError') {
			if (port < maxPort) {
				runServer(scriptPath, port + 1);
			} else {
				throw Error('Regression test cannot find open port after maximum tries.');
			}
		} 
	});  
} 






