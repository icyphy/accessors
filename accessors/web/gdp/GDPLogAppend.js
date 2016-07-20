/* Append to a Global Data Plane (GDP) log. */

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

/** Append to a Global Data Plane (GDP) log.
 *
 *  @parameter {string} debugLevel The value of the GDP debug flag.  See
 *  gdp/README.md for a complete summary.  The value is typically
 *  "pattern=level", for example "gdplogd.physlog=39".  To see the
 *  patterns, use the "what" command or strings $PTII/lib/libgdp* |
 *  grep '@(#)'.  Use "*=40" to set the debug level to 40 for all
 *  components. The value of level is not usually over 127.  Values
 *  over 100 may modify the behavior.
 *  @param {string} logname The GDP logname.  By convention, use 
 *  a reverse fully qualified name like
 *  "org.ptolemy.actor.lib.jjs.modules.gdp.demo.GDPLogRead.GDPLogRead"
 *  @input {string} data The data to be written
 *  @input trigger An input that triggers firing the reading of the data

 *  @author Edward A. Lee, Nitesh Mor. Contributor: Christopher Brooks
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, addInputParameter, console, exports, get, getParameter, input, parameter, removeInputHandler, require */
/*jshint globalstrict: true */
"use strict";

var GDP = require('gdp');
var log = null;
var handle = null;

exports.setup = function() {
    this.input('data', {'type': 'string'});
    this.parameter('debugLevel', {'type': 'string'});
    this.parameter('logname', {'type': 'string'});
    this.input('trigger');
};

exports.append = function(data) {
    console.log("GDPLogAppend.append()");
    console.log(typeof(log));
    var dataValues = this.get('data');
    console.log('GDPLogAppend.js.append(): ' + dataValues);
    log.append(dataValues);
};

exports.initialize = function() {
    var logname = this.getParameter('logname');
    if (logname === '') {
        throw new Error('The logname parameter cannot be empty.');
    }
    log = new GDP.GDP(logname, 2);
    log.setDebugLevel(this.getParameter('debugLevel'));
    handle = this.addInputHandler('trigger', this.exports.append.bind(this));
};

exports.wrapup = function() {
    if (handle !== null) {
        this.removeInputHandler(handle);
    }
};
