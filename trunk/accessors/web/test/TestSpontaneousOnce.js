// Test accessor that spontaneously produces outputs once.
//
// Copyright (c) 2016 The Regents of the University of California.
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
 *  @accessor test/TestSpontaneousOnce
 *  @parameter interval The interval before the output in milliseconds.
 *  @output output Output for the counting sequence, of type number.
 *  @author Christopher Brooks. Based on TestSpontaneous by Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearTimeout, console, error, exports, require, setTimeout */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.parameter('interval', {'type': 'number', 'value': 1000});
    this.output('output', {'type': 'number'});
};

// These variables will not be visible to subclasses.
var handle = null;
var count = 0;

exports.initialize = function () {
    count = 0;
    // Need to record 'this' for use in the callback.
    var thiz = this;
    handle = setTimeout(function () {
        count += 1;
        thiz.send('output', count);
    }, this.getParameter('interval'));
};

exports.wrapup = function () {
    if (handle) {
        clearTimeout(handle);
        handle = null;
    }
};
