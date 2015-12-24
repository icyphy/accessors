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
 *  This accessor tests composition of other accessors.
 *
 *  @accessor TestCompositeAccessor
 *  @author Edward A. Lee
 */

var util = require('util');

exports.setup = function() {
    input('input', {'type':'number', 'value':0});
    output('output', {'type':'number'});
    var gain1 = instantiate('hosts/common/test/TestGainAccessor');
    var gain2 = instantiate('hosts/common/test/TestGainAccessor');
    var adder = instantiate('hosts/common/test/TestAdderAccessor');
    gain2.setParameter('gain', 4);
    connect('input', gain1, 'input');
    connect('input', gain2, 'input');
    connect(gain1, 'output', adder, 'inputLeft');
    connect(gain2, 'output', adder, 'inputRight');
    connect(adder, 'output', 'output');
}

exports.fire = function() {
    console.log('TestCompositeAccessor fired.');
}

exports.initialize = function() {
    // FIXME: This should be provided by a base class accessor.
}