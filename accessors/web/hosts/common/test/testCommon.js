// Test code for functions to be shared among accessor hosts.
//
// Copyright (c) 2015-2017 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//

// Simple script to test the common host. To run it, in this directory,
// just do:
//     node testCommon.js

// The file system module 'fs', is not available under Duktape, CapeCode or Nashorn.
//if (typeof Duktape !== 'object') {
var hasFsModule = true;

if (typeof Duktape === 'object' || (typeof Packages !== 'undefined' && typeof Packages.java.util.Vector === 'function')) {
    hasFsModule = false;
}

if (hasFsModule) {
    // Require the filesystem module to read the accessor source code.
    var fs = require('fs');
}

// Provide the required getAccessorCode function that every host needs.
// Search for a .js file in a search path.
getAccessorCode = function (name) {
    // We need this so that we can run the test from ant using mocha.
    // See test/mocha/testCommon.js.

    // The path elements should end with a slash.
    var searchPath = ['./', '../', '../../', '../../../', '../../../../', '../../../../../', 'web/', 'org/terraswarm/accessor/accessors/web/'];

    var pathName, src;
    
    // For node, add _dirname.  If this is not done, then if this test
    // is run before node/tests/mocha/testNodeAuto.js, then
    // testNodeAuto.js will fail.
    if (typeof __dirname !== 'undefined') {
        searchPath.splice(0, 0, __dirname + '/');
    }
    for (i = 0; i < searchPath.length; i++) {
        // Append a '.js' to the name, if needed.
        if (name.indexOf('.js') !== name.length - 3) {
            name += '.js';
        }
        try {
            if (hasFsModule) {
                pathName = searchPath[i] + name;
                //console.log("testCommon.js: pathName: " + pathName);
                if (fs.statSync(pathName).isFile()) {
                    return fs.readFileSync(pathName, 'utf8');
                }
            } else {
                pathName = searchPath[i] + name;
                // print("testCommon.js: pathName: " + pathName);

                if (typeof Duktape === 'object') {
                    src = FileIo.readfile(pathName);
                    // FIXME: jshint warns "Invalid typeof value 'buffer'", but this might be ok for Duktape2.x
                    if (typeof src === 'buffer') {
                        // print("testCommon.js: returning contents of " + pathName);
                        return src;
                    }
                } else {
                    // Nashorn
                    var FileReader = java.io.FileReader,
                        BufferedReader = java.io.BufferedReader,
                        buffered;
                    src = '';

                    try {
                        buffered = new BufferedReader(new FileReader(pathName));
                        while ((line = buffered.readLine()) !== null) {
                            src += line + '\n';
                        }
                    } finally {
                        if (typeof buffered !== 'undefined') {
                            buffered.close(); // close the stream so there's no file locks
                        }
                    }
                    // print("testCommon.js: returning contents of " + pathName);
                    return src;
                }
            }
        } catch (e) {
            //print("getAccessorCode(" + name + "):" + e);
        }
    }
    throw ('Failed to find ' + name + ". Looked in " + searchPath);
};

// Read the accessor source code.
var code = getAccessorCode('test/TestAccessor');

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

        // Don't print a stack trace here, it is confusing.  Instead,
        // throw a new Error(), which will have the stack

        // // Print a stack trace.
        // var e = new Error('dummy');
        // var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
        //     .replace(/^\s+at\s+/gm, '')
        //     .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        //     .split('\n');
        // console.log("==== testCommon.js: test Failed: \"" + testName + "\"\n\tExpression     \"" + expression + "\" is !=\n\tExpectedValue: \"" + expectedValue + "\"");
        // console.log("\tThe stack was:");
        // console.log(stack);

        // Use throw new Error() here so that we get a stack
        throw new Error('*** Test failed: ' + testName +
            '. Expected: ' + expectedValue +
            ', but got: ' + expression);
    } else {
        console.log('Test passed: ' + testName);
    }
}

// Check this.getParameter() with default value.
test('TestAccessor: getParameter', instance.getParameter('p'), 42);

// Check this.setParameter() and getParameter.
instance.setParameter('p', 12);
test('TestAccessor: setParameter', instance.getParameter('p'), 12);

// Check this.get().
test('TestAccessor: get', instance.get('numeric'), 0);

// Check this.get() with no input yet provided.
test('TestAccessor: get with undefined', instance.get('untyped'), null);

// Check this.get() with no input yet provided but type being boolean.
test('TestAccessor: get with undefined', instance.get('boolean'), null);

// Check provideInput().
instance.provideInput('boolean', true);
test('TestAccessor: provideInput()', instance.get('boolean'), true);

// Check inputHandlers, send, and latestOutput.
instance.react();
test('TestAccessor: react, send, and latestOutput', instance.latestOutput('negation'), false);

// Check composite accessors with manual and automatic scheduling.

// Have to provide an implementation of this.instantiate(), which in this case will only
// instantiate accessors founds in the accessors repo directory.
var code = getAccessorCode('test/TestComposite');
var a = new commonHost.Accessor('TestComposite', code, getAccessorCode);
a.initialize();

// Check assigned priorities.
test('TestComposite: priority number of destination is higher than source',
    a.containedAccessors[0].priority < a.containedAccessors[1].priority,
    true);

a.provideInput('input', 10);
a.containedAccessors[0].react();
a.containedAccessors[1].react();
test('TestComposite: composite accessor with manual scheduling',
    a.latestOutput('output'), 50);

a.initialize();
a.provideInput('input', 5);
a.react();
test('TestComposite: composite accessor with automatic scheduling',
    a.latestOutput('output'), 25);

// Note that the following two tests will run concurrently (!)

// Test spontaneous accessor.
var b = commonHost.instantiateAccessor('TestSpontaneous', 'test/TestSpontaneous',
    getAccessorCode);

b.initialize();
setTimeout(function () {
    test('TestSpontaneous: Test that spontaneous accessor produces 0 after 1 second',
        b.latestOutput('output'), 0);
}, 1500);
setTimeout(function () {
    test('TestSpontaneous: Test that spontaneous accessor produces 1 after 2 seconds',
        b.latestOutput('output'), 1);
    b.wrapup();
}, 2500);

// Test composite spontaneous accessor.
var c = commonHost.instantiateAccessor(
    'TestCompositeSpontaneous', 'test/TestCompositeSpontaneous', getAccessorCode);
c.initialize();
setTimeout(function () {
    test('TestCompositeSpontaneous: Test that composite spontaneous accessor produces 0 after 1 second',
        c.latestOutput('output'), 0);
}, 1500);
setTimeout(function () {
    test('TestCompositeSpontaneous: Test that composite spontaneous accessor produces 4 after 2 seconds',
        c.latestOutput('output'), 4);
    c.wrapup();
}, 2500);

// Test this.extend().
var d = commonHost.instantiateAccessor(
    'TestInheritance', 'test/TestInheritance', getAccessorCode);
d.initialize();
d.provideInput('untyped', 'foo');
d.react();
test('TestInheritance: inheritance, function overriding, and variable visibility',
    d.latestOutput('jsonOfUntyped'), 'hello');

// Test this.implement().
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

// Test two-level inheritance.
var g = commonHost.instantiateAccessor(
    'TestDerivedAgainA', 'test/TestDerivedAgainA', getAccessorCode);
g.initialize();
g.provideInput('in1', 42);
g.react();
test('TestDerivedAgainA: two-level inheritance, out1', g.latestOutput('out1'), 2);
test('TestDerivedAgainA-2: two-level inheritance, out2', g.latestOutput('out2'), 2);
