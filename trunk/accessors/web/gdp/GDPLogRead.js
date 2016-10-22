/* Read a log. */

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

/** Read a log from the Global Data Plane (GDP).
 *
 *  @output {string} data The data that is read from the log
 *
 *  @param {string} logname The GDP logname.  By convention, use 
 *  a reverse fully qualified name like
 *  "org.terraswarm.accessors.demo.MyDemoName"
 *
 *  @param {string} logdname The name of the logd server.  If empty,
 *  then the hostname of the local machine is used.
 *
 *  @input trigger An input that triggers firing the reading of the data.
 *
 *  @input {int} recno The record number to be read.  In the GDP,
 *  the first record is record 1.
 *
 *  @parameter {string} debugLevel The value of the GDP debug flag.
 *  See gdp/README-developers.md for a complete summary.  The value is
 *  typically "pattern=level", for example "gdplogd.physlog=39".  To
 *  see the patterns, use the "what" command or strings
 *  $PTII/lib/libgdp* | grep '@(#)'.  Use "*=40" to set the debug
 *  level to 40 for all components. The value of level is not usually
 *  over 127.  Values over 100 may modify the behavior.
 *
 *  @accessor gdp/GDPLogRead
 *  @author Edward A. Lee, Nitesh Mor. Contributor: Christopher Brooks
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, console, exports, get, getParameter, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true */
"use strict";

var GDP = require('gdp');
var handle = null;
var log = null;
var oldLogname = null;

/** Setup the parameters and ports. */
exports.setup = function() {
    this.output('data', {'type': 'string'});
    this.parameter('debugLevel', {'type': 'string'});
    this.input('logname', {'type': 'string', 'value': 'org.terraswarm.accessors.demo.MyDemoName'});
    this.input('logdname', {'type': 'string', 'value': 'edu.berkeley.eecs.gdp-01.gdplogd'});
    this.input('trigger');
    this.input('recno', {'type': 'int'});
};

/** Read a record and send the data on the output.
 *  Note that if the log does not exist, it will be created
 *  and a null will be sent.
 */
exports.read = function() {
    var recno = this.get('recno');
    console.log("GDPLogRead.read(" + recno + "): start");
    var logname = this.get('logname');
    if (logname === '') {
        throw new Error('The logname parameter cannot be empty.');
    }
    if (logname != oldLogname) {
	    console.log("GDPLogRead.read(" + recno + "): About to call new GDP.GDP()");
	    var logdname = this.get('logdname');
	    log = new GDP.GDP(logname, 1, logdname);
	    log.setDebugLevel(this.getParameter('debugLevel'));
	    oldLogname = logname;
    }
    // FIXME: If recno == 0, then calling new GDP.GDP() and then trying to read results in 'ERROR: 404 not found [Berkeley:Swarm-GDP:404]'
    if (recno <= 0) {
	    console.log("GDPLogRead.read(" + recno + "): recno was 0, sending nil");
	    this.send('data', 'nil');
    } else {
	    var data = log.read(recno);
	    console.log("GDPLogRead.read(" + recno + "): sending " + data);
	    this.send('data', data);
    }
};

/** Add an input handler that will read data. */
exports.initialize = function() {
    oldLogname = null;
    handle = this.addInputHandler('trigger', this.exports.read.bind(this));
};

/** Remove the input handler. */
exports.wrapup = function() {
    if (handle !== null) {
        this.removeInputHandler(handle);
    }
};
