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

/** Test top-level functions provided by the host.
 *
 *  @accessor test/TestFunctions
 *  @output getResource Outputs the contents of index.html if the host implements
 *   this.getResource() and can serve contents given 'index.html' as the URI.
 *  @output httpRequest Outputs the contents of index.html if the host implements
 *   httpRequest() and can serve contents given 'index.html' as the URL.
 *  @output readURL Outputs the contents of index.html if the host implements
 *   readURL() and can serve contents given 'index.html' as the URL.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, httpRequest, readURL, require */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.output('getResource', {'type': 'string'});
    this.output('httpRequest', {'type': 'string'});
    this.output('readURL', {'type': 'string'});
};

exports.fire = function () {
    try {
        this.send('getResource', this.getResource('index.html', 3000));
    } catch (exception) {
        this.send('getResource', 'FAILED: ' + exception);
    }
    try {
        this.send('httpRequest', httpRequest('index.html', 'GET'));
    } catch (exception2) {
        this.send('httpRequest', 'FAILED: ' + exception2);
    }
    try {
        this.send('readURL', readURL('index.html'));
    } catch (exception3) {
        this.send('readURL', 'FAILED: ' + exception3);
    }
};
