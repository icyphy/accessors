// Test accessor with various input and output types and handlers.
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

/** Test accessor with various input and output types and handlers.
 *  This accessor is designed to be instantiable on any host, including
 *  the common host, which does not implement the require() function
 *  nor provide any mechanism for loading accessors.
 *
 *  @accessor test/TestAccessor
 *  @parameter p A parameter with default value 42.
 *  @input untyped An untyped input that will accept any JavaScript object.
 *  @input numeric A numeric input.
 *  @input boolean A boolean input.
 *  @output typeOfUntyped Produces the type (a string) of the input named 'untyped'.
 *  @output jsonOfUntyped Produces a JSON representation of the input named 'untyped',
 *   created using JSON.toString().
 *  @output numericPlusP Produces the value of the 'numeric' input plus 'p'.
 *  @output negation Produces the negation of the 'boolean' input.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

exports.setup = function() {
    this.input('untyped');                               // Untyped input.
    this.input('numeric', {'type':'number', 'value':0}); // Numeric input.
    this.input('boolean', {'type':'boolean'});           // Boolean input.
    this.output('typeOfUntyped', {'type':'string'});     // Type of untyped input.
    this.output('jsonOfUntyped', {'type':'string'});     // JSON of untyped input.
    this.output('numericPlusP', {'type':'number'});      // Numeric input plus p.
    this.output('negation', {'type':'boolean'});         // Negation of boolean input.
    this.parameter('p', {'value':42});                   // Untyped, with numeric value.
};

// Base class variable that is visible to subclasses through inheritance.
exports.variable = 'hello';

exports.initialize = function() {
    // Respond to any input by updating them all.
    this.addInputHandler('untyped', function() {
        this.send('typeOfUntyped', typeof this.get('untyped'));
        // Refer to the function using 'this.exports' rather than 'exports'
        // to allow an override. Note that we choose here to invoke formatOutput
        // with 'this' bound to 'this.exports'.
        this.send('jsonOfUntyped', this.exports.formatOutput(this.get('untyped')));
    });
    this.addInputHandler('numeric', function() {
        this.send('numericPlusP', this.get('numeric') + this.getParameter('p'));
    });
    this.addInputHandler('boolean', function() {
        this.send('negation', !this.get('boolean'));
    });
};

/** Define a function that can be overridden in subclasses. */
exports.formatOutput = function(value) {
    return 'JSON for untyped input: ' + JSON.stringify(value);
};

exports.fire = function() {
    console.log('TestAccessor.fire() invoked.');
};
