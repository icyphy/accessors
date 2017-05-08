// Copyright (c) 2016-2016 The Regents of the University of California.
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

/** Simple base class accessor with one input and one output that outputs the value
 *  of a local property (with value 1) in the exports object when an input arrives.
 *  @accessor test/TestBaseC
 *  @author Edward A. Lee
 *  @input in1 A trigger input.
 *  @output out1 The current value of the local property, which defaults to 1 in this
 *   base class.
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.input('in1');
    this.output('out1');
};

exports.initialize = function () {
    // Careful to refer to this.exports.inputHandler, not
    // just exports.inputHandler. The latter refers specifically
    // to the function defined in this base class, whereas the former
    // refers to a function that may be an override in a derived class.
    this.addInputHandler('in1', this.exports.inputHandler);
};

exports.inputHandler = function () {
    // Use of this.exports allows subclasses to override the value of the baseField.
    // Using just exports.baseField would always access the variable defined here,
    // even if a subclass invokes this function.
    this.send('out1', this.exports.baseField);
};

exports.baseField = 1;
