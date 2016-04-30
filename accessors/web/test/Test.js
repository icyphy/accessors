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
 *  Test output is currently logged to the console window.  In the browser host, 
 *  please open a debugging pane to see the console.  A future improvement
 *  would be to output results to a port and provide formatting options (JUnit).
 *  For an overview of the testing capabilities of different hosts, please see:  
 *  https://www.terraswarm.org/accessors/wiki/Main/Testing
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

// TODO:  Add an output port for the results.
// TODO:  Be able to load multiple test files.

//For some reason, the mocha library loads itself into window.mocha.  
//TODO:  Figure out why and change to load similar to other libraries.
//TODO:  Module for node and duktape
// https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
var mocha = require('mocha');
if (Object.keys(mocha).length === 0 && 
		JSON.stringify(mocha) === JSON.stringify({}) && 
		typeof window !== "undefined") {
	mocha = window.mocha;
}

var chai = require('chai');

exports.setup = function () {
	mocha.setup('bdd');
    this.input('testFile', {'type': 'string', 'value': "/accessors/hosts/common/modules/mocha/testCommon.js"});
    
	// browser.js loads commonHost already.  Load for other hosts.
	commonHost = commonHost || require('hosts/common/commonHost.js');
};

exports.initialize = function () {
    this.addInputHandler('testFile', function () {
        var fileName = this.get('testFile');
        if (fileName !== null && fileName !== "") {
            require(fileName);
            mocha.run();
        }
    });
};


