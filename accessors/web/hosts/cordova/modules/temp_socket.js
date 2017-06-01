// Copyright (c) 2015-2017 The Regents of the University of California.
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
//

/**
 * Module supporting TCP sockets.
 * This module defines three classes, SocketClient, SocketServer, and Socket.
 *
 * To establish a connection, create an instance of SocketServer and listen for
 * connection events. When a connection request comes in, the listener will be
 * passed an instance of Socket. The server can send data through that instance
 * and listen for incoming data events.
 *
 * On another machine (or the same machine), create an instance of SocketClient.
 * When the connection is established to the server, this instance will emit an
 * 'open' event. When data arrives from the server, it will emit a 'data' event.
 * You can invoke this.send() to send data to the server.
 *
 * The this.send() function can accept data in many different forms.
 * You can send a string, an image, a number, or an array of numbers.
 * Two utility functions supportedReceiveTypes() and supportedSendTypes()
 * tell you exactly which data types supported by the host.
 * Arrays of numeric types are also supported.
 *
 * If the rawBytes option is true (the default), then data is sent without any
 * message framing. As a consequence, the recipient of the data may emit only a
 * portion of any sent data, or it may even coalesce data provided in separate
 * invocations of this.send(). If rawBytes is false, then messages will be framed so
 * that each invocation of this.send() results in exactly one data item emitted at the
 * other end.  This will only work if both sides of the connection implement the
 * same framing protocol, e.g. if they both are implemented with this same module.
 * To communicate with external tools that do not support this message framing
 * protocol, leave rawBytes set to true.
 *
 * The message framing protocol used here is very simple. Each message is preceded
 * by one byte indicating the length of the message. If the message has length
 * greater than 254, then the value of this byte will be 255 and the subsequent four
 * bytes will represent the length of the message. The message then follows these bytes.
 *
 * @module @accessors-modules/socket
 * @author Christopher Brooks, based on the Cape Code socket module by Edward A. Lee
 * @version $$Id: socket.js 1615 2017-05-02 16:46:09Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals actor, console, exports, Java, require, util */
/*jslint nomen: true */
/*jshint globalstrict: true */
"use strict";

//var SocketHelper = Java.type('ptolemy.actor.lib.jjs.modules.socket.SocketHelper');
var EventEmitter = require('events').EventEmitter;

///////////////////////////////////////////////////////////////////////////////
//// connect

/** Return an array of the types supported by the current host for
 *  receiveType arguments.
 */

var socket = {
    connect: function() {
        chrome.sockets.tcp.create(function(createInfo) {
            MobileLog('New socket created');
            chrome.sockets.tcp.connect(createInfo.socketId, '172.217.4.142', 80, function(result) {
            if (result === 0) {
                MobileLog('connect: success');
            } else {
                MobileLog('connection failed');
            }
          });
        });
    },
    disconnect: function() {
        MobileLog('Disconnect not implemented yet.');
    }
};

exports.socket = socket;
