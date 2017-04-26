// Test composite accessor.
//
// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** Test composite accessor.
 *  This accessor contains two accessors, a gain and an adder.
 *  It multiplies the input by 4 and adds the result to the input.
 *  The sum is sent to the output.
 *
 *  @accessor test/TestComposite
 *  @input input A numeric input with default value 0.
 *  @output output The result of x + 4x, where x is the value of the input.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.input('input', {
        'type': 'number',
        'value': 0
    });
    this.output('output', {
        'type': 'number'
    });

    var gain = this.instantiate('TestGain', 'test/TestGain'),
        adder = this.instantiate('TestAdder', 'test/TestAdder');

    gain.setParameter('gain', 4);

    this.connect('input', adder, 'inputLeft');
    this.connect('input', gain, 'input');
    this.connect(gain, 'scaled', adder, 'inputRight');
    this.connect(adder, 'sum', 'output');
};

// NOTE: If you provide a fire() function for a composite accessor,
// then it is up to you to invoke react() on the contained accessors.

// NOTE: If you provide an initialize() function for a composite accessor,
// then it is up to you to initialize the contained accessors.
