// Copyright (c) 2014-2016 The Regents of the University of California.
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

/** This accessor sends UDP (datagram) messages to the specified
 *  destination address and port.
 *
 *  The send type can be any of those supported by the host.  The list
 *  of supported types will be provided as options for the `sendType`
 *  parameter. For the Ptolemy II host, these include at least
 *  'string', 'number', 'image', and a variety of numeric types.
 *
 *  Note that UDP, unlike TCP, has the notion of a "message" (a
 *  datagram). A message can contain more than one byte.  The
 *  `receiveType` determines the type of the elements sent
 *  by this accessor
 *
 *  @accessor net/UDPSocketSender
 *  @author Hokeun Kim and Edward A. Lee, Contributor: Christopher Brooks
 *  @version $$Id$$
 *
 *  @input toSend The message to send.
 *  @input {string} destinationAddress The host name or IP address to send to.
 *   This defaults to "localhost".
 *  @input {int} destinationPort The port to send to.
 *   This defaults to 8084.
 *  @parameter {string} sendType See above.
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
exports.setup = function () {
    this.input('toSend');

    this.input('destinationAddress', {
        'value': 'localhost',
        'type': 'string'
    });

    this.input('destinationPort', {
        'value': 8084,
        'type': 'int'
    });
    this.parameter('sendType', {
        type : 'string',
        value : 'string'
    });

    // Attempt to add a list of options for types, but do not error out
    // if the socket module is not supported by the host.
    try {
        this.parameter('sendType', {
            options : UDPSocket.supportedSendTypes()
        });
    } catch (err) {
        this.error(err);
    }
};

var socket = null;

exports.initialize = function () {
    var self = this;

    socket = UDPSocket.createSocket();
    socket.on('error', function (message) {
        self.error(message);
    });
    socket.setSendType(this.get('sendType'));
    this.addInputHandler('toSend', function () {
        var message = self.get('toSend');
        socket.send(message,
                    self.get('destinationPort'),
                    self.get('destinationAddress'));
    });
};

exports.wrapup = function () {
    // This null check avoids an error in code generation.
    if (socket !== null) {
        socket.close();
    }
};
