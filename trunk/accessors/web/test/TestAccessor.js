// Test accessor for various accessor hosts, but not for the common host.
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

/** Test accessor for various accessor hosts.
 *  This accessor requires that the host implement the require() function,
 *  which the common host does not.
 *
 *  @accessor TestAccessor
 *  @author Edward A. Lee
 */

var util = require('util');

exports.setup = function() {
    input('untyped');                               // Untyped input.
    input('numeric', {'type':'number', 'value':0}); // Numeric input.
    input('boolean', {'type':'boolean'});           // Boolean input.
    output('typeOfUntyped', {'type':'string'});     // Type of untyped input.
    output('jsonOfUntyped', {'type':'string'});     // JSON of untyped input.
    output('numericPlusP', {'type':'number'});      // Numeric input plus p.
    output('negation', {'type':'boolean'});         // Negation of boolean input.
    parameter('p', {'value':42});                   // Untyped, with numeric value.
}

exports.fire = function() {
    console.log('TestAccessor fired.');
}

exports.initialize = function() {
    // Respond to any input by updating them all.
    addInputHandler('untyped', function() {
        send('typeOfUntyped', typeof get('untyped'));
        send('jsonOfUntyped', util.format('JSON for untyped input: %j', get('untyped')));
    });
    addInputHandler('numeric', function() {
        send('numericPlusP', get('numeric') + getParameter('p'));
    });
    addInputHandler('boolean', function() {
        send('negation', !get('boolean'));
    });
}