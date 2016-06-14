/* Subscribe to a log. */

// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** Subscribe to a log.
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, getParameter, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true */
"use strict";

var GDP = require('gdp');
var log = null;
var handle = null;

exports.setup = function() {
    this.input('trigger');
    this.output('data', {'type': 'string'});
    this.parameter('logname', {'type': 'string'});
    this.parameter('startrec', {'type': 'int', 'value': 0});
    this.parameter('numrec', {'type': 'int', 'value':0});
    this.parameter('timeout', {'type': 'int', 'value':0});
};

exports.getNextData = function() {
    console.log("GDPLogSubscribe.getNextData()");
    // this blocks
    while (true) {
        var data = log.getNextData(100);
        console.log("GDPLogSubscribe.getNextData() data: " + data);
        if (data !== null) {
            this.send('data', data); 
            break;
        }
    }
};

exports.initialize = function() {
    console.log("GDPLogSubscribe.initialize()");
    var logname = this.getParameter('logname');
    if (logname === '') {
        throw new Error('The logname parameter cannot be empty.  The _gdp_gcl_subscribe() C function will crash the JVM if the logname is empty.');
    }
    log = new GDP.GDP(logname, 1);
    
    log.subscribe(this, this.getParameter('startrec'), this.getParameter('numrec'), this.getParameter('timeout'));
    console.log("GDPLogSubscribe.initialize() after subscribe()");
    handle = this.addInputHandler('trigger', this.exports.getNextData.bind(this));
};

exports.wrapup = function() {
    if (handle !== null) {
        this.removeInputHandler(handle);
    }
};
