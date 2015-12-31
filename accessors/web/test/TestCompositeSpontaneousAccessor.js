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
 *  This test contains a single accessor that produces a counting sequence.
 *
 *  @accessor TestCompositeSpontaneousAccessor
 *  @author Edward A. Lee
 */

exports.setup = function() {
    output('output', {'type':'number'});
    var gen = instantiate('test/TestSpontaneousAccessor');
    var gain = instantiate('test/TestGainAccessor');
    gain.setParameter('gain', 4);
    connect(gen, 'output', gain, 'input');
    connect(gain, 'scaled', 'output');
}

// NOTE: If you provide a fire() function, it is up to you to invoke react() on
// the contained accessors.

// NOTE: If you provide an initialize() function, it is up to you to initialize
// the contained accessors.
