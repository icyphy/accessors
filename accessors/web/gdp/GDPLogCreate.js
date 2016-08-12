/* Create a Global Data Plane (GDP) log. */

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

/** Create a Global Data Plane (GDP) log.
 *
 *  @parameter {string} debugLevel The value of the GDP debug flag.  See
 *  gdp/README.md for a complete summary.  The value is typically
 *  "pattern=level", for example "gdplogd.physlog=39".  To see the
 *  patterns, use the "what" command or strings $PTII/lib/libgdp* |
 *  grep '@(#)'.  Use "*=40" to set the debug level to 40 for all
 *  components. The value of level is not usually over 127.  Values
 *  over 100 may modify the behavior.
 *  @input {string} logname The GDP logname.  By convention, use 
 *  a reverse fully qualified name like
 *  "org.ptolemy.actor.lib.jjs.modules.gdp.demo.GDPLogRead.GDPLogRead"
 *  @input {string} logdname The IP address or DNS name of the gdp
 *  router.  If empty, then the swarm.gdp.routers key is searched for
 *  in the gdp configuration file ep_adm_para, in the following order
 *  "`.ep_adm_params:~/.ep_adm_params:/usr/local/etc/ep_adm_params:/etc/ep_adm_params`"
 *  The values of swarm.gdp.routers are then contacted in order.
 *  @input trigger An input that triggers firing the reading of the data
 *  @output output An output that is written to when the creation is complete.
 *
 *  @author Christopher Brooks
 *  @version $$Id: GDPLogCreate.js 865 2016-07-20 14:11:58Z cxh $$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, addInputParameter, console, exports, get, getParameter, input, parameter, removeInputHandler, require */
/*jshint globalstrict: true */
"use strict";

var GDP = require('gdp');
var log = null;
var handle = null;

/** Setup the parameters and ports. */
exports.setup = function() {
    this.parameter('debugLevel', {'type': 'string'});
    this.input('logname', {'type': 'string', 'value': 'myLog'});
    this.input('logdname', {'type': 'string', 'value': ''});
    this.output('output', {'type': 'string'});
    this.input('trigger');
};

/** If the log is not present, then create it.
 */
exports.create = function() {
    console.log("GDPLogCreate.js: create() Start.");
    var logname = this.get('logname');
    if (logname === '') {
        throw new Error('The logname parameter cannot be empty.');
    }
    var logdname = this.get('logdname');
    log = new GDP.GDP(logname, 3, logdname);
    log.setDebugLevel(this.getParameter('debugLevel'));
    this.send('output', logname);
    console.log("GDPLogCreate.js: create() Done!");
};

/** Add an input handler that will create the log. */
exports.initialize = function() {
    console.log("GDPLogCreate.js: initialize()");
    handle = this.addInputHandler('trigger', this.exports.create.bind(this));
};

/** Remove the input handler. */
exports.wrapup = function() {
    if (handle !== null) {
        this.removeInputHandler(handle);
    }
};
