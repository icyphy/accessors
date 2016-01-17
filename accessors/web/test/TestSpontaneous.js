// Test accessor that spontaneously produces outputs once per time interval.
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

/** Test accessor that spontaneously produces outputs once per time interval.
 *  This implementation produces a counting sequence.
 *
 *  @accessor test/TestSpontaneous
 *  @parameter interval The interval between outputs in milliseconds.
 *  @output output Output for the counting sequence, of type number.
 *  @author Edward A. Lee
 */

exports.setup = function() {
    parameter('interval', {'type':'number', 'value':1000});
    output('output', {'type': 'number'});
}
var handle = null;
var count = 0;

exports.initialize = function() {
    count = 0;
    handle = setInterval(function() {
        send('output', count++);
    }, getParameter('interval'));
}

exports.wrapup = function() {
    if (handle) {
        clearInterval(handle);
        handle = null;
    }
}