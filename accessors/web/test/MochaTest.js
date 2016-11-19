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
 *  In Cape Code, there is a demo available at:
 *  $PTII/ptolemy/actor/lib/jjs/modules/testing/demo/Testing/Testing.xml
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
 *  Test results are send to the output port and logged to the console.  
 *  A future improvement is to format results JUnit-style.
 *
 *  @accessor test/Test
 *  @input testFile The test file to execute.
 *  @output result The test result.
 *  @author Elizabeth Osyk
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals console, exports, require*/
/*jshint globalstrict: true*/
'use strict';

// FIXME:  Why does this not work if defined in testing.js vs. here??
if (typeof window === 'undefined') {
	var window = {};
}

try {
    var commonHost = require('commonHost.js');
} catch (err) {
    // Needed for node host.
    // Do not remove this unless (cd accessors/web; ant test.mocha) works.
    var commonHost = require('../common/commonHost.js');
}
try {
    var Testing = require('testing');
    var testing = new Testing.Testing();
} catch (err) {
    if (commonHost.accessorHost === commonHost.accessorHostsEnum.NODE) {
        // Needed for node host.
        // Do not remove this unless (cd accessors/web; ant test.mocha) works.
        console.error("require('testing') failed.  This happens under node.");
    } else {
        throw err;
    }
}

exports.setup = function () {
	// TODO:  Same file for all.  Put in common?  Or in test/Test?
    this.input('testFile', {'type': 'string', 'value': "/accessors/hosts/common/modules/mocha/testCommon.js"});
    this.output('result', {'type': 'string'});
};

exports.initialize = function () {
    // Capture 'this' for use in callback.
    var self = this;
	
    this.addInputHandler('testFile', function () {
        var fileName = self.get('testFile');
        if (fileName !== null && fileName !== "") {
        	testing.loadTestFile(fileName);
        	testing.run();
        }
    });
    
    try {
        // Register an event listener for the test results.
        testing.on('end', function(result) {
    	    self.send('result', result);
        });
    } catch (err) {
        if (commonHost.accessorHost === commonHost.accessorHostsEnum.NODE) {
            // Needed for node host.
            // Do not remove this unless (cd accessors/web; ant test.mocha) works.
            console.error("testing.on failed.  This happens under node.");
        } else {
            throw err;
        }
    }
};
