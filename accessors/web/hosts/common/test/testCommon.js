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
var code = fs.readFileSync('../../../test/TestAccessor.js', 'utf8');

// Require the accessor module to turn the source code into an accessor instance.
var commonHost = require('../commonHost.js');

// Create an accessor instance.
var instance = new commonHost.Accessor('TestAccessor', code);

// Invoke the initialize function.
instance.initialize();

// Examine the instance in JSON format.
console.log('Instance of TestAccessor: %j\nTests:', instance);

function test(testName, expression, expectedValue) {
    if (expression != expectedValue) {
        // Print a stack trace.
        var e = new Error('dummy');
        var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
                .replace(/^\s+at\s+/gm, '')
                .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
                .split('\n');
        console.log(stack);
        
        throw('Test failed: ' + testName
                + '. Expected: ' + expectedValue
                + ', but got: ' + expression);
    } else {
        console.log('Test passed: ' + testName);
    }
}

// Check getParameter() with default value.
test('TestAccessor: getParameter', instance.getParameter('p'), 42);

// Check setParameter() and getParameter.
instance.setParameter('p', 12);
test('TestAccessor: setParameter', instance.getParameter('p'), 12);

// Check get().
test('TestAccessor: get', instance.get('numeric'), 0);

// Check get() with no input yet provided.
test('TestAccessor: get with undefined', instance.get('untyped'), null);

// Check get() with no input yet provided but type being boolean.
test('TestAccessor: get with undefined', instance.get('boolean'), null);

// Check provideInput().
instance.provideInput('boolean', true);
test('TestAccessor: provideInput()', instance.get('boolean'), true);

// Check inputHandlers, send, and latestOutput.
instance.react();
test('TestAccessor: react, send, and latestOutput', instance.latestOutput('negation'), false);

// Check composite accessors with manual and automatic scheduling.

// Have to provide an implementation of instantiate(), which in this case will only
// instantiate accessors founds in the accessors repo directory.
getAccessorCode = function(name) {
    return fs.readFileSync('../../../' + name + '.js', 'utf8');
}
var code = getAccessorCode('test/TestComposite');
var a = new commonHost.Accessor('TestComposite', code, getAccessorCode);
a.initialize();

// Check assigned priorities.
test('TestComposite: priority number of destination is higher than source',
        a.containedAccessors[0].priority < a.containedAccessors[1].priority,
        true);

a.provideInput('input', 10)
a.containedAccessors[0].react()
a.containedAccessors[1].react()
test('TestComposite: composite accessor with manual scheduling',
        a.latestOutput('output'), 50);

a.initialize();
a.provideInput('input', 5)
a.react();
test('TestComposite: composite accessor with automatic scheduling',
        a.latestOutput('output'), 25);

// Note that the following two tests will run concurrently (!)

// Test spontaneous accessor.
var b = commonHost.instantiateAccessor('TestSpontaneous', 'test/TestSpontaneous',
        getAccessorCode);
b.initialize();
setTimeout(function() {
    test('TestSpontaneous: spontaneous accessor produces 0 after 1 second',
            b.latestOutput('output'), 0);
}, 1500);
setTimeout(function() {
    test('TestSpontaneous: spontaneous accessor produces 1 after 2 seconds',
            b.latestOutput('output'), 1);
    b.wrapup();
}, 2500);

// Test composite spontaneous accessor.
var c = commonHost.instantiateAccessor(
        'TestCompositeSpontaneous', 'test/TestCompositeSpontaneous', getAccessorCode);
c.initialize();
setTimeout(function() {
    test('TestCompositeSpontaneous: composite spontaneous accessor produces 0 after 1 second',
            c.latestOutput('output'), 0);
}, 1500);
setTimeout(function() {
    test('TestCompositeSpontaneous: composite spontaneous accessor produces 4 after 2 seconds',
            c.latestOutput('output'), 4);
    c.wrapup();
}, 2500);

// Test extend().
var d = commonHost.instantiateAccessor(
        'TestInheritance', 'test/TestInheritance', getAccessorCode);
d.initialize();
d.provideInput('untyped', 'foo');
d.react();
test('TestInheritance: inheritance, function overriding, and variable visibility',
        d.latestOutput('jsonOfUntyped'), 'hello');

// Test implement().
var e = commonHost.instantiateAccessor(
        'TestImplement', 'test/TestImplement', getAccessorCode);
e.initialize();
e.provideInput('numeric', '42');
e.react();
test('TestImplement: implementing an interface',
        e.latestOutput('numericPlusP'), 84);

// Test access to exported fields of base classes an proper scoping of initialize().
var f = commonHost.instantiateAccessor(
        'TestDerivedC', 'test/TestDerivedC', getAccessorCode);
f.initialize();
f.provideInput('in1', '42');
f.react();
test('TestDerivedC: access to base class exports properties',
        f.latestOutput('out1'), 2);
