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

/** This accessor discovers devices on the local area network.
 *  It requires the discovery module.  Please see:
 *  https://www.terraswarm.org/accessors/wiki/Version0/Discovery
 * 
 *  @accessor net/Discovery
 *  @author Elizabeth Latronico (beth@berkeley.edu)
 *  @input {string} hostIP The IP address of the host.  Used to discover other
 *   devices on the local area network.
 *  @output devices An object containing IP addresses and (when
 *   available) names and MAC addresses of devices on the local area network.
 *  @parameter {boolean} useNmap True if nmap should be used for discovery, 
 *   false to use ping and arp.  Default is false.
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, accessor, error, exports, get, removeInputHandler, require, send  */
/*jshint globalstrict: true*/
'use strict';

var discovery = require('discovery');
// Initialize ds here, instead of in setup(), so that the ds object is defined
// when the ds.on() function is encountered.
// But surround in a try-catch so that the browser host or any other host
// that does not support the discovery module can proceed and at least read
// the interface.
var ds;
try {
    ds = new discovery.DiscoveryService();  
} catch(err) {
    error('Failed to instantiate discovery service: ' + err);
}

/** Define inputs and outputs. */
exports.setup = function () {
    
    this.input('hostIP', {
        type: 'string',
    });
    
    this.output('devices');
    
    this.parameter('useNmap', {
        type: 'boolean',
        value: false,
    });
};

var handle;

/** Upon receiving a host IP address, discover devices on the corresponding 
 *  local area network.
 */
exports.initialize = function () {
    var self = this;
    handle = this.addInputHandler('hostIP', function() {
        if (self.get('useNmap')) {
            ds.discoverDevices(self.get('hostIP'), 'nmap');
        } else {
            ds.discoverDevices(self.get('hostIP'));
        }
    });
};

/** Upon wrapup, stop handling new inputs.  */
exports.wrapup = function () {
    this.removeInputHandler(handle);
};

/** When discovery is finished, send a list of devices.  */
if (ds) {
    var self = this;
    ds.on('discovered', function(data) {
        if (data === "") {
            self.send('error', 'Error:  No devices found.  At minimum, the host machine should be found.');
        } else {
            self.send('devices', data);
        }
    });
}
