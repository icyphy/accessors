// Test a composite accessor containing a spontaneous accessor.
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

/** Test a composite accessor containing a spontaneous accessor.
 *  This test contains an accessor that produces a counting sequence that is then
 *  fed into a TestGain accessor, which multiplies the counting sequence by 4.
 *
 *  @accessor test/TestCompositeSpontaneous
 *  @output output A counting sequence with increments of 4.
 *  @author Edward A. Lee
 */

exports.setup = function() {
    this.output('output', {'type':'number'});
    var gen = this.instantiate('TestSpontaneous', 'test/TestSpontaneous');
    var gain = this.instantiate('TestGain', 'test/TestGain');
    gain.setParameter('gain', 4);
    this.connect(gen, 'output', gain, 'input');
    this.connect(gain, 'scaled', 'output');
}

// NOTE: If you provide a fire() function for a composite accessor,
// then it is up to you to invoke react() on the contained accessors.

// NOTE: If you provide an initialize() function for a composite accessor,
// then it is up to you to initialize the contained accessors.
