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

/** Subscribe to a Global Data Plane (GDP) log.
 *
 *  FIXME: What is the meaning of the startrec and numrec arguments? Makes no sense for subscription.
 *
 *  @output {string} data The data that is read from the log.
 *
 *  @input {string} logname The GDP logname.  By convention, a log name should be 
 *   a reverse fully qualified name like "org.terraswarm.accessor.demo.MyDemoName".
 *   If this input is an empty string, then no subscription will
 *   occur until a non-empty value is provided.
 *   By default, this is empty.
 *   Providing an empty string will unsubscribe from any previously subscribed-to log.
 *
 *  @input {string} logdname The name of a logd server.  If empty,
 *   then the hostname of the local machine is used. This server is
 *   a gateway into the GDP.
 *   FIXME: Shouldn't this be a parameter rather than input?
 *
 *  @input {int} numrec The number of records to read.
 *
 *  @input {int} startrec The record number to be read.  In the GDP,
 *  the first record is record 1.
 *
 *  @input {int} timeout The timeout in milliseconds.
 *
 *  @parameter {string} debugLevel The value of the GDP debug flag.
 *  See gdp/README-developers.md for a complete summary.  The value is
 *  typically "pattern=level", for example "gdplogd.physlog=39".  To
 *  see the patterns, use the "what" command or strings
 *  $PTII/lib/libgdp* | grep '@(#)'.  Use "*=40" to set the debug
 *  level to 40 for all components. The value of level is not usually
 *  over 127.  Values over 100 may modify the behavior.
 *
 *  @accessor gdp/GDPLogSubscribe
 *  @author Christopher Brooks, Edward A. Lee, Nitesh Mor
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, console, exports, getParameter, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true */
"use strict";

var GDP = require('gdp');
var log = null;
var handle = null;
var oldLogname = null;

// If getNextData() returns null data, then set sawNull to true.
var sawNull = false;

/** Setup the parameters and ports. */
exports.setup = function () {
    this.output('data', {'type': 'string'});
    this.parameter('debugLevel', {'type': 'string'});
    this.input('logname', {'type': 'string', 'value': ''});
    this.input('logdname', {'type': 'string', 'value': 'edu.berkeley.eecs.gdp-01.gdplogd'});
    this.parameter('numrec', {'type': 'int', 'value': 0});
    this.parameter('startrec', {'type': 'int', 'value': 0});
    this.parameter('timeout', {'type': 'int', 'value': 0});
};

/** Add an input handler that will subscribe to a log. */
exports.initialize = function () {
    var self = this;

    // Set an input handler to unsubscribe and then invoke this initialize()
    // function when a new logname is provided.
    this.addInputHandler('logname', function () {
        // If there is an open subscription, close it.
        self.exports.wrapup.call(self);
        // Open the new subscription.
        self.exports.subscribe.call(self);
    });
    self.exports.subscribe.call(self);
};

/** If a non-empty logname is given, subscribe to the log. */
exports.subscribe = function () {
    var self = this, logname = this.get('logname'), logdname = this.get('logdname');

    if (logname === '') {
        // Nothing more to do.
        return;
    }

    // Create or connect to a log.
    // The second argument specifies to open the log "read only."
    log = new GDP.GDP(logname, 1, logdname);

    // Listen for data from the log.
    log.on('data', function (data) {
        console.log('****** received: ' + data);
        self.send('data', data);
        console.log('****** sent data: ' + data);
    });

    log.setDebugLevel(this.getParameter('debugLevel'));

    // Subscribe to the log so that 'data' events are emitted.
    log.subscribe(
        this.getParameter('startrec'),
        this.getParameter('numrec'),
        this.getParameter('timeout')
    );
};

/** Unsubscribe to the log. */
exports.wrapup = function () {
    if (log) {
        log.unsubscribe();
    }
};
