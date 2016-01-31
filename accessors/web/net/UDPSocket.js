// Copyright (c) 2014-2015 The Regents of the University of California.
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

/** UDP socket accessor.
 *  This accessor listens to the UDP port, and outputs whatever arrives as a string.
 *  When a message arrives on the 'send' input, that message is sent over the socket.
 *
 *  @accessor net/UDPSocket
 *  @author Hokeun Kim
 *  @version $$Id$$
 *  @input {int} port The port to use for the socket.
 *  @output {string} received The received string.
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, console, exports, get, input, output, require, send */
/*jshint globalstrict: true*/
'use strict';

// This accessor requires the optional 'udpSocket' module, which may or may
// not be provided by an accessor host. Most hosts will provide this module.
var UDPSocket = require('udpSocket');

// Set up the accessor. In an XML specification, this information would
// be provided in XML syntax.
exports.setup = function() {
    this.input('port', {
        'value': 8084,
        'type':'int'
    });
    this.input('toSend');
    this.output('received', {
        'type':'string'
    });
};

// Define the functionality.
function onMessage(message) {
    console.log('Received a UDP packet: ' + message);
    this.send('received', message);
}

var socket = null;

exports.initialize = function() {
    socket = UDPSocket.createSocket();
    socket.on('message', onMessage.bind(this));
    var port = this.get('port');
    socket.bind(port);
    var self = this;
    this.addInputHandler('toSend', function() {
        var message = self.get('toSend');
        socket.send(message);
    });
};

exports.wrapup = function() {
    socket.close();
};
