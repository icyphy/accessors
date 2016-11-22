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

/** Append string data to a Global Data Plane (GDP) log.
 *  If a log with the specified name does not exist, it is automatically
 *  created.
 *
 *  @input {string} data The data to be written.
 *
 *  @param {string} logname The GDP logname.  By convention, use
 *   a reverse fully qualified name like
 *   "org.terraswarm.accessors.demo.MyDemoName"
 *
 *  @param {string} logdname The name of a logd server.  If empty,
 *   then the hostname of the local machine is used. The logd server
 *   is a gateway into the GDP.
 *
 *  @parameter {string} debugLevel The value of the GDP debug flag.
 *   See gdp/README-developers.md for a complete summary.  The value is
 *   typically "pattern=level", for example "gdplogd.physlog=39".  To
 *   see the patterns, use the "what" command or strings
 *   $PTII/lib/libgdp* | grep '@(#)'.  Use "*=40" to set the debug
 *   level to 40 for all components. The value of level is not usually
 *   over 127.  Values over 100 may modify the behavior.
 *
 *  @accessor gdp/GDPLogAppend
 *  @author Christopher Brooks, Edward A. Lee, Nitesh Mor
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, addInputParameter, console, exports, get, getParameter, input, parameter, removeInputHandler, require */
/*jshint globalstrict: true */
"use strict";

var GDP = require('gdp');
var handle = null;
var log = null;
var oldLogname = null;

exports.setup = function () {
    console.log("GDPLogAppend.js: setup()");
    this.input('data', {'type': 'string'});
    this.input('logname', {'type': 'string', 'value': 'org.terraswarm.accessors.myLog'});
    this.input('logdname', {'type': 'string', 'value': 'edu.berkeley.eecs.gdp-01.gdplogd'});
    this.parameter('debugLevel', {'type': 'string'});
};

/** Append data from the input port 'data' to the log.
 *  If necessary, first create the log.
 */
exports.append = function () {
    var logname = this.get('logname'), logdname, dataValues;
    if (logname === '') {
        throw new Error('The logname parameter cannot be empty.');
    }
    console.log('Append to log named: ' + logname);
    if (logname !== oldLogname) {
        logdname = this.get('logdname');
        log = new GDP.GDP(logname, 2, logdname);
        log.setDebugLevel(this.getParameter('debugLevel'));
        oldLogname = logname;
    }
    dataValues = this.get('data');
    console.log('Append data: ' + dataValues);
    log.append(dataValues);
};

/** Add an input handler that will append data. */
exports.initialize = function () {
    console.log("GDPLogAppend.js: initialize()");
    oldLogname = null;
    handle = this.addInputHandler('data', this.exports.append.bind(this));
};

/** Remove the input handler. */
exports.wrapup = function () {
    if (log) {
        log.close();
    }
    if (handle !== null) {
        this.removeInputHandler(handle);
    }
};
