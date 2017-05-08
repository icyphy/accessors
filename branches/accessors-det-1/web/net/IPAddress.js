// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** This accessor outputs the IP address of the local machine.
 *
 *  @accessor net/IPAddress
 *  @author Elizabeth Latronico (beth@berkeley.edu), based on IPAddress actor
 *  by Christopher Brooks
 *  @input {boolean} trigger Send a token here to produce an output.
 *  @output {string} IPAddress The IP address of the local machine.
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals error, exports, require */
/*jshint globalstrict: true*/
'use strict';

var discovery = require('@accessors-modules/discovery');
// Initialize ds here, instead of in setup(), so that the ds object is defined
// when the ds.on() function is encountered
// But surround in a try-catch so that the browser host or any other host
// that does not support the discovery module can proceed and at least read
// the interface.
var ds;
try {
    ds = new discovery.DiscoveryService();
} catch (err) {
    error('Failed to instantiate discovery service: ' + err);
}

/** Define inputs and outputs. */
exports.setup = function () {

    this.input('trigger', {
        type: 'boolean'
    });

    this.output('IPAddress', {
        type: 'string'
    });
};

/** Upon receiving a trigger input, output the host machine's IP address.
 */
exports.initialize = function () {
    var self = this;
    this.addInputHandler('trigger', function () {
        self.send('IPAddress', ds.getHostAddress());
    });
};
