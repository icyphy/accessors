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
 *  This script opens the test web page which loads the Test accessor, loads a 
 *  test file, executes the test file and POSTs the results back to the local 
 *  server.
 *  
 *  This script currently requires the Firefox browser.
 *  
 *  To run, first install the selenium-webdriver module:
 *  npm install -g selenium-webdriver
 *  
 *  Then,
 *  node testScript.js
 */

var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;

var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

driver.get("http://localhost:8089/accessors/hosts/browser/test/test/regressionTest.html");

// Wait until page has loaded
driver.wait(function() {
	return driver.isElementPresent(By.id('reactToInputs'));
}, 10000).then(function() {
	driver.findElement(By.id('reactToInputs')).click();
});

// Quit after some time.  
// TODO:  Would be better to use an event listener for when REST accessor 
// receives a response.  Possible?

setTimeout(function() { driver.quit()}, 20000);

