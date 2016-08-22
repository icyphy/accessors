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
 *
 *  @output {string} data The data that is read from the log
 *
 *  @parameter {string} debugLevel The value of the GDP debug flag.
 *  See gdp/README-developers.md for a complete summary.  The value is
 *  typically "pattern=level", for example "gdplogd.physlog=39".  To
 *  see the patterns, use the "what" command or strings
 *  $PTII/lib/libgdp* | grep '@(#)'.  Use "*=40" to set the debug
 *  level to 40 for all components. The value of level is not usually
 *  over 127.  Values over 100 may modify the behavior.
 *
 *  @param {string} logname The GDP logname.  By convention, use 
 *  a reverse fully qualified name like
 *  "org.ptolemy.actor.lib.jjs.modules.gdp.demo.GDPLogRead.GDPLogRead"
 *
 *  @param {string} logdname The name of the logd server.  If empty,
 *  then the hostname of the local machine is used.
 *
 *  @input {int} numrec The number of records to read.

 *  @input {int} startrec The record number to be read.  In the GDP,
 *  the first record is record 1.
 *
 *  @input {int} timeout The timeout in milliseconds.
 *
 *  @input trigger An input that triggers firing the subscription.
 *
 *  @author Edward A. Lee, Nitesh Mor. Contributor: Christopher Brooks
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
var oldLogname = null;

// If getNextData() returns null data, then set sawNull to true.
var sawNull = false;

/** Setup the parameters and ports. */
exports.setup = function() {
    this.output('data', {'type': 'string'});
    this.parameter('debugLevel', {'type': 'string'});
    this.input('logname', {'type': 'string', 'value': 'myLog'});
    this.input('logdname', {'type': 'string', 'value': ''});
    this.parameter('numrec', {'type': 'int', 'value':0});
    this.parameter('startrec', {'type': 'int', 'value': 0});
    this.parameter('timeout', {'type': 'int', 'value':0});
    this.input('trigger');
};

/** Get the next data.
 *  If necessary create the log.
 */
exports.getNextData = function() {
    console.log("GDPLogSubscribe.js: getNextData()");
    var logname = this.get('logname');
    if (logname === '') {
        throw new Error('The logname parameter cannot be empty.  The _gdp_gcl_subscribe() C function will crash the JVM if the logname is empty.');
    }

    // The logname may change between initialization trigger getting
    // the input.
    if (logname != oldLogname) {
	// console.log("GDPLogSubscribe.read(): About to call new GDP.GDP()");
	var logdname = this.get('logdname');
	log = new GDP.GDP(logname, 1, logdname);
	log.setDebugLevel(this.getParameter('debugLevel'));
	oldLogname = logname;
	log.subscribe(this, this.getParameter('startrec'), this.getParameter('numrec'), this.getParameter('timeout'));

    }

    var data = log.getNextData(100);
    if (data !== null) {
	sawNull = false;
	this.send('data', data); 
    } else {
	if (!sawNull) {
	    this.send('data', 'datum was null?'); 
	}
	sawNull = true;
    }
};

/** Add an input handler that will subscribe to a log. */
exports.initialize = function() {
    console.log("GDPLogSubscribe.js: initialize()");
    oldLogname = null;
    sawNull = false;
    handle = this.addInputHandler('trigger', this.exports.getNextData.bind(this));
};

/** Remove the input handler. */
exports.wrapup = function() {
    if (handle !== null) {
        this.removeInputHandler(handle);
    }
};
