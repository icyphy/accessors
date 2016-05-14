// A composite accessor that accepts a test file name and executes the tests.
//
// Copyright (c) 2016 The Regents of the University of California.
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

/** A composite accessor that accepts a test file name and executes the tests.
 *  Tests are written using the Mocha framework.  The test results are displayed 
 *  to the console window.
 *  
 *  To run:
 *  For the browser, first, start the test server.  Please see:
 *  /accessors/web/hosts/browser/test/README.txt
 *  Open a browser window and point to:
 *  http://localhost:8088/hosts/browser/test/test/testRunner.html
 *  Click "react to inputs".  The test output will appear at the top of the 
 *  page, and also in the browser console window.  You may need to open a 
 *  debugging pane to see the console window.  
 *  
 *  In node, from the command prompt, change to the directory:
 *  /accessors/web/hosts/node/test/mocha
 *  Execute:
 *  node ../../nodeHostShell.js < ./testCommon.js
 *  
 *  The Mocha framework allows developers to describe a test case, execute code, 
 *  then check assertions.  Mocha tracks each assertion and reports if the 
 *  assertion is satisfied or if it fails.  Add-on libraries extend Mocha's 
 *  capabilities.  Chai is an assertion library offering "should", "expect", and 
 *  "assert" styles.  Sinon is used for creating test spies, stubs and mocks; 
 *  for example, mocking an HTTP response.   
 *  Please see this page for instructions on installing Mocha, Chai and Sinon 
 *  and writing tests.  
 *  https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSMocha
 *  
 *  For an overview of the testing capabilities of different hosts, please see:  
 *  https://www.terraswarm.org/accessors/wiki/Main/Testing
 *
 *  Test output is currently logged to the console window.  A future improvement
 *  would be to output results to a port and provide formatting options (JUnit).
 *
 *  The Test accessor requires the following to be defined.  Currently, there
 *  are some host dependencies.  Eventually, these functions will be refactored 
 *  into a module.
 *  - Accessor()
 *  - getAccessorCode()
 *  - instantiateAccessor()
 *  - mocha
 *  - chai
 *  - sinon  
 *
 *  @accessor test/Test
 *  @input testFile The test file to execute.
 *  @author Elizabeth Osyk
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals exports, require*/
/*jshint globalstrict: true*/
'use strict';

// TODO:  Be able to load multiple test files.

// In the browser, the mocha library loads itself into window.mocha.
// TODO:  Figure out why and change to load similar to other libraries.

// In node, instantiate a new mocha interface. 
// https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
// TODO:  Module for duktape and Cape Code.

var mocha;
//if (typeof commonHost === 'undefined') {
//    var commonHost = require('common/commonHost.js');
//}

try {
    commonHost = commonHost || require('../../../common/commonHost.js');
} catch (error) {
    try {
        // Needed for nodeHost
        var commonHost = require('../common/commonHost.js');
    } catch (error) {
        // We will get to here in the CapeCode host.
        // To test this, run $PTII/bin/vergil -capecode, then File -> New -> Cape Code Model,
        // then expand the Accessors tab, then the Test tab.
        var commonHost = require('commonHost.js');
    }
}


if (typeof window !== 'undefined' && typeof window.mocha !== 'undefined'){
	require('mocha');
	mocha = window.mocha;
	mocha.setup('bdd');
} else {
        // The Cape Code host does not define process.
        if (typeof process !== 'undefined') {
	    var Mocha = require('mocha');
	    mocha = new Mocha({
		ui: 'bdd'
	    });
        }
}

exports.setup = function () {
    this.input('testFile', {'type': 'string', 'value': "/accessors/hosts/common/modules/mocha/testCommon.js"});
    this.output('result', {'type': 'string'});
};

exports.initialize = function () {
    // Capture 'this' for use in callback.
    var self = this;
	
    this.addInputHandler('testFile', function () {
        var fileName = this.get('testFile');
        if (fileName !== null && fileName !== "") {
        	// In browser, just require the file. 
        	// In node, use mocha's addFile() method.
        	// TODO:  Refactor this stuff into a module.
        	if (typeof window !== 'undefined') {
        		require(fileName);
        	} else {
	                if (typeof mocha !== 'undefined') {
        		    mocha.addFile(fileName);
                        } else {
                            throw new Error('Test.js: mocha was not defined.  This is a known problem with the Cape Code host and the Test accessor.');
                        }
        	}
        	
        	// Register for mocha events and report test outcomes to the console.
        	// TODO:  Refactor this into a separate reporter.  Report in JUnit format.
        	// http://stackoverflow.com/questions/29050720/run-mocha-programatically-and-pass-results-to-variable-or-function
            mocha.run()
            .on('test', function(test) {
                console.log('Test started: '+ test.title);
            })
            .on('test end', function(test) {
                console.log('Test done: '+ test.title);
            })
            .on('pass', function(test) {
                console.log('Test passed: ' + test.title);
            })
            .on('fail', function(test, err) {
                console.log('Test failed: ' + test.title);
                console.log(err);
            })
            .on('end', function() {
                console.log('All done.');
                // TODO:  Send complete results to the output port.
                self.send('result', 'tests finished');
            });
            
        }	// end if
    });
};


