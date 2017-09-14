// Accessor that gets a resource
//
// Copyright (c) 2017 The Regents of the University of California.
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

/** Accessor that gets a resource from a file or ULR.
 *
 *  @accessor util/GetResource
 *  @input resource {string} The file or URL to be read.  Defaults to
 *  the Accessors home page (http://accessors.org).
 *  @input timeout {number} The timeout in milleseconds.  Defaults to
 *  3000 ms., which is 3 seconds.
 *  @input trigger {boolean} Send a token to this input to read the
 *  file or URL.
 *  @output output The contents of the file or URL.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearInterval, exports, require, setInterval */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.input('resource', {
        'type': 'string',
        'value': 'http://accessors.org'
    });
    this.input('timeout', {
        'type': 'number',
        'value': 3000
    });
    this.input('trigger');

    this.output('output');
};
exports.initialize = function () {
    var self = this;
    this.addInputHandler('trigger', function () {
        var resourceValue = this.get('resource');
        var timeoutValue = this.get('timeout');
        self.send('output', getResource(resourceValue, timeoutValue));
    });
};

