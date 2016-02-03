// Test accessor that adds its input values.
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

/** Test accessor that adds its input values.
 *
 *  @accessor test/TestAdder
 *  @input inputLeft The left input, a number with default 0.
 *  @input inputRight The right input, a number with default 0.
 *  @output sum The sum of the two inputs.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

exports.setup = function() {
    this.input('inputLeft', {'type':'number', 'value':0});
    this.input('inputRight', {'type':'number', 'value':0});
    this.output('sum', {'type':'number'});
};

exports.fire = function() {
    this.send('sum', this.get('inputLeft') + this.get('inputRight'));
};
