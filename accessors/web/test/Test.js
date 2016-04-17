// A composite accessor that accepts a test file name and executes the tests.
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

/** A composite accessor that accepts a test file name and executes the tests.
 *  The test results are displayed to the console window.
 *
 *  @accessor test/Test
 *  @input testFile The test file to execute.
 *  @author Elizabeth Osyk
 *  @version $$Id$$
 */

// TODO:  Add an output port for the results.
// TODO:  Be able to load multiple test files.

// TODO:  Refactor testing functions into a test module?
//var test = require('test');

// This accessor sssumes the following are defined:
// Accessor
// getAccessorCode
// instantiateAccessor
// mocha
// chai
// sinon

exports.setup = function() {
    this.input('testFile', {'type':'string'});
};

exports.initialize = function() {
    this.addInputHandler('testFile', function() {
        var fileName = this.get('testFile');
        if (fileName != null && fileName != "") {
        	require(fileName);
        	mocha.run();
        }
    });
};


