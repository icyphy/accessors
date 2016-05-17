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

// testing.loadTestFile();
// testing.run();
// testing.getResults();

// TODO:
// testing.clearTests();  How to unload test files?
// testing.loadTest(string);  How to load tests as strings vs. a file?
// testing.setReporter(string);	 Support different report formats

// TODO:  Include chai and sinon here, and create test cases.  So they don't 
// have to go in the test case file.  
// Alternatively they can go in the test case file if they take up too much space.


var EventEmitter = require('events').EventEmitter;
var util = require('util');

exports.Testing = function() {
	EventEmitter.call(this);
	
	// Think this will create separate instances of mocha - not really what I want?
	// In the browser, the mocha library loads itself into window.mocha.  Not sure why.
	require('mocha');
	this.mocha = window.mocha;
	mocha.setup('bdd');
	
	// TODO:  Data structures to store the results
};
util.inherits(exports.Testing, EventEmitter);

exports.Testing.prototype.loadTestFile = function(filename) {
	require(filename);
};

exports.Testing.prototype.run = function() {
	var self = this;
	var results = "";
	
	// Register for mocha events and report test outcomes to the console.
	// TODO:  Refactor this into a separate reporter.  Report in JUnit format.
	// http://stackoverflow.com/questions/29050720/run-mocha-programatically-and-pass-results-to-variable-or-function
	
	this.mocha.run()
		.on('test', function(test) {
			results = results + '\nTest started: '+ test.title;
		    console.log('Test started: '+ test.title);
		})
		.on('test end', function(test) {
			results = results + '\nTest done: '+ test.title;
		    console.log('Test done: '+ test.title);
		})
		.on('pass', function(test) {
			results = results + '\nTest passed: '+ test.title;
		    console.log('Test passed: ' + test.title);
		})
		.on('fail', function(test, err) {
			results = results + '\nTest failed: ' + test.title;
		    console.log('Test failed: ' + test.title);
		    console.log(err);
		})
		.on('end', function() {
			results = results + "\nAll done.";
		    console.log('All done.');
		    self.emit('end', results);
		    // TODO:  Create a reporter to format results in Junit format.
		});
};
