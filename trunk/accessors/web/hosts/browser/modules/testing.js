// A module to load and run tests.  Uses mocha and chai.
//Copyright (c) 2015 The Regents of the University of California.
//All rights reserved.

//Permission is hereby granted, without written agreement and without
//license or royalty fees, to use, copy, modify, and distribute this
//software and its documentation for any purpose, provided that the above
//copyright notice and the following two paragraphs appear in all copies
//of this software.

//IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
//FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
//ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
//THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
//SUCH DAMAGE.

//THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
//INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
//MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
//PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
//CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
//ENHANCEMENTS, OR MODIFICATIONS.

// TODO:
// testing.clearTests();  How to unload test files?
// testing.loadTest(string);  How to load tests as strings vs. a file?
// testing.setReporter(string);	 Support different report formats

// TODO:  Include chai and sinon here, and create test cases.  So they don't 
// have to go in the test case file.  
// Alternatively they can go in the test case file if they take up too much space.


var EventEmitter = require('events').EventEmitter;
var util = require('util');

/** Create a Testing object.  A Testing object can load and execute a mocha 
 *  test file.
 */
exports.Testing = function() {
	EventEmitter.call(this);
	
	// In the browser, the mocha library loads itself into window.mocha.  
	require('mocha');
	this.mocha = window.mocha;
	mocha.setup('bdd');
	
	// Record the port number of the test server serving accessors.
	// FIXME:  Better way to do this?  'testing' module is not visible in Mocha file.
	commonHost.testing = {};
	commonHost.testing.port = location.port;
};
util.inherits(exports.Testing, EventEmitter);

/** Mark completed suites.  A suite is completed if it has no more test 
 * cases and no sub-suites.  If a suite is completed, check if parent is 
 * also now completed.  
 * @param suite The suite to check for completion.
*/
exports.Testing.prototype.completeSuite = function(suite) {
	var incomplete = false;
	
	// If suite has no sub-suites, mark it completed and print closing tag.	
	if (!suite.hasOwnProperty("suites") || suite.suites.length < 1) {
		suite.completed = true;
		this.xmlOutput.push("</testsuite>\n");
		
		// Check if parent is now completed.
		this.completeSuite(suite.parent);
	} else {
		for (var i = 0; i < suite.suites.length; i++) {
			// If suite has subsuites, check if they are completed.
			
			// First, check for empty suites (no tests and no sub-suites).
			// Empty suites do not generate a "suite" event, but do exist
			// as sub-suites of some parent suite.  These need to be marked 
			// as completed.
			var childSuite = suite.suites[i];
			if ( (!childSuite.hasOwnProperty("completed") || childSuite.completed === false) &&
				  (!childSuite.hasOwnProperty("tests") || childSuite.tests.length === 0 ) && 
				  (!childSuite.hasOwnProperty("suites") || childSuite.suites.length === 0)) {
				childSuite.completed = true;
			} else if (!childSuite.hasOwnProperty("completed") || !childSuite.completed) {
				incomplete = true;
				break;
			}
		}
		
		if(!incomplete) {
			suite.completed = true;
			this.xmlOutput.push("</testsuite>\n");
			
			// Check if parent is now completed.
			if (suite.hasOwnProperty("parent")) {
				this.completeSuite(suite.parent);
			}
		}
	}

};

/** Load a mocha test file.
 * @parma filename  The path and name of the mocha file to load.
 */
exports.Testing.prototype.loadTestFile = function(filename) {
	require(filename);
};

/** Remove characters that are not valid in XML from text.
 * @param {string} Original text.
 * @returns {string} Text without invalid XML characters.
 */
exports.Testing.prototype.removeInvalidCharacters = function(input){
  // A subset of invalid characters as defined in http://www.w3.org/TR/xml/#charsets that can occur in e.g. stacktraces
  var INVALID_CHARACTERS = ['\u001b'];
	
  return INVALID_CHARACTERS.reduce(function (text, invalidCharacter) {
    return text.replace(new RegExp(invalidCharacter, 'g'), '');
  }, input);
};

/** Remove the test case with the given full title, since it is completed.
 * This function assumes that test cases have unique full names.
 * This function should initially be called on the root suite.  
 * The function will recursively call itself until the test case is found.
 * @suite The suite that might contain the test case.  Initially, the 
 * root suite.
 * @fullTitle The full title of the test case, which includes the titles of
 * all ancestor suites.
 */
exports.Testing.prototype.removeTest = function(suite, fullTitle){
	var found = false;
	
	// Check this suite for test case.  If found, remove it.
	if (suite.hasOwnProperty("tests")) {
		for (var i = 0; i < suite.tests.length; i++) {
			if (suite.tests[i].fullTitle() === fullTitle) {
				suite.tests.splice(i, 1);
				found = true;
				break;
			}
		}
	}
	
	if (found) {
		// If all test cases are completed, check if the suite is completed.
		// I.e., all sub-suites are also completed.
		if (suite.tests.length === 0){
			this.completeSuite(suite);
		}
	} else {
		// Otherwise, keep looking for the test case.
		if (suite.hasOwnProperty("suites")) {
			for (var i = 0; i < suite.suites.length; i++){
				this.removeTest(suite.suites[i], fullTitle);
			}
		} 
	}
};

/** Execute a series of test cases.  run() assumes that a test file has been 
 * loaded.  Test results are logged to the console.  Emit an 'end' event with 
 * the results in JUnit format.  
 */ 
exports.Testing.prototype.run = function() {
	var self = this;
	
	// Register for mocha events and report test outcomes to the console.
	// Output results in JUnit format in addition to default HTML format.
	
	// A 'start' event doesn't appear to be generated, so perform setup here.
	
	// Track the current root suite, and therefore any sub-suites, to 
	// properly handle nested tags in the XML output.
	this.currentSuite = {};
	this.xmlOutput = [];		
	this.xmlOutput.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
	this.xmlOutput.push("<testsuites>\n");
	
	// The Root Suite does not seem to generate a suite event in the browser
	// (it does in the Ptolemy version of mocha).  Print opening tag, using
	// "BrowserHost" as the root name. 
	self.xmlOutput.push("<testsuite " + 
			"name=\"BrowserHost\" tests=\"0\">\n");
	
	/** Run mocha and create a report in text and JUnit format.
	// Portions of the code are copied and modified from mocha-junit-reporter.
	// https://github.com/michaelleeallen/mocha-junit-reporter
	/* 
	 * MIT License
	Copyright (c) 2015 Michael Allen

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	 */
	this.mocha.run()
		.on('start', function(){
			console.log('starting');
		})
		.on('suite', function(suite) {
		    if (suite.root) {
		    	suite.title = 'BrowserHost';
			}
		    
		    // If this suite is at the top level of the hierarchy, remember it.
		    if (Object.keys(self.currentSuite).length === 0) {
		    	self.currentSuite = suite;
		    }
		    
		    // Print opening tag for this suite.
		    // FIXME:  Not able to print number of failures this way.  
		    // Would need to wait until all tests are complete.
			self.xmlOutput.push("<testsuite " + 
					"name=\"" + suite.title + "\" tests=\"" + 
					suite.tests.length + "\"" + ">\n");
			
			// If suite has no tests or suites, print closing tag.
			// NOTE: A "suite" event does not seem to be generated in this case.
			// Check just in case.
			if ( (!suite.hasOwnProperty("tests") || suite.tests.length < 1) &&
				 (!suite.hasOwnProperty("suites") || suite.suites.length < 1)) {
				suite.complete = true;
				self.xmlOutput.push("</testsuite>\n");
			}
		})
		.on('test', function(test) {
		    console.log('Test started: '+ test.title);
		})
		.on('test end', function(test) {
		    console.log('Test done: '+ test.title);
		})
		.on('pass', function(test) {
		    console.log('Test passed: ' + test.title);
		    
			self.xmlOutput.push("<testcase");
			self.xmlOutput.push("name=\"" + test.fullTitle() + "\" classname=\"BrowserHost\">");
			self.xmlOutput.push("</testcase>\n");
			
			// Remove this test case from the current suite.  If there are no
			// more test cases, print a closing tag for the suite, recursively.
			self.removeTest(self.currentSuite, test.fullTitle());
		})
		.on('fail', function(test, err) {
		    console.log('Test failed: ' + test.title);
		    console.log(err);
		    
			self.xmlOutput.push("<testcase");
			self.xmlOutput.push("name=\"" + test.title + "\" >");
			
			self.xmlOutput.push("<failure message=\"" + 
					self.removeInvalidCharacters(err.stack) +
					"\"/>");
			
			self.xmlOutput.push("</testcase>\n");
			
			// Remove this test case from the current suite.  If there are no
			// more test cases, print a closing tag for the suite, recursively.
			self.removeTest(self.currentSuite, test.fullTitle());
		})
		.on('end', function() {
		    console.log('All done.');
			self.xmlOutput.push("</testsuites>\n");
			var xmlString = self.xmlOutput.join(' ');
			console.log(xmlString);
			self.emit('end', xmlString);
		});
};
