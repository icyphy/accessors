// Test accessor that multiplies its input by a scale factor.
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

/** Test accessor that multiplies its input by a scale factor.
 *
 *  @accessor test/TestGain
 *  @param gain The gain, a number with default 2.
 *  @param input The input, a number with default 0.
 *  @param scaled The output, the result of input * gain.
 *  @author Edward A. Lee
 */

exports.setup = function() {
    this.input('input', {'type':'number', 'value':0});
    this.output('scaled', {'type':'number'});
    this.parameter('gain', {'type':'number', 'value':2});
}

exports.initialize = function() {
    this.addInputHandler('input', function() {
        this.send('scaled', this.get('input') * this.getParameter('gain'));
    });
}