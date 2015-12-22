// Test code for functions to be shared among accessor hosts.
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

// Require the filesystem module to read the accessor source code.
var fs = require('fs');

// Read the accessor source code.
var code = fs.readFileSync('./SimpleTestAccessor.js', 'utf8');

// Require the accessor module to turn the source code into an accessor instance.
var commonHost = require('../commonHost.js');

// Create an accessor instance.
var instance = commonHost.instantiate(code);

// Invoke the initialize function.
instance.initialize();

// Examine the instance in JSON format.
console.log('Instance of TestAccessor: %j\nTests:', instance);

function test(testName, expression, expectedValue) {
    if (expression != expectedValue) {
        throw('Test failed: ' + testName
                + '. Expected: ' + expectedValue
                + ', but got: ' + expression);
    } else {
        console.log('Test passed: ' + testName);
    }
}

// Check getParameter() with default value.
test('getParameter', instance.getParameter('p'), 42);

// Check setParameter() and getParameter.
instance.setParameter('p', 12);
test('setParameter', instance.getParameter('p'), 12);

// Check get().
test('get', instance.get('numeric'), 0);

// Check get() with input undefined.
test('get with undefined', instance.get('boolean'), undefined);

// Check provideInput().
instance.provideInput('boolean', true);
test('provideInput()', instance.get('boolean'), true);

// Check inputHandlers, send, and latestOutput.
instance.invokeHandlers();
test('inputHandlers, send, and latestOutput', instance.latestOutput('negation'), false);

