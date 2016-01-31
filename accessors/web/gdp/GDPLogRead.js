/* Read a log. */

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

/** Read a log.
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, get, getParameter, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true */
"use strict";

var GDP = require('gdp');
var log = null;
var handle = null;

exports.setup = function() {
    this.input('trigger');
    this.input('recno', {'type': 'int'});
    this.output('data', {'type': 'string'});
    this.parameter('logname', {'type': 'string'});
};


exports.read = function() {
    var recno = this.get('recno');
    var data = log.read(recno);
    this.send('data', data);
};

exports.initialize = function() {
    var logname = this.getParameter('logname');
    log = GDP.GDP(logname, 1);
    handle = this.addInputHandler('trigger', this.read);
};

exports.wrapup = function() {
    if (handle !== null) {
        this.removeInputHandler(handle);
    }
};
