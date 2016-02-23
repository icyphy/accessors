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

/**
 * Module supporting web socket clients for the browser host.
 * Web sockets differ from HTTP interactions by including a notion
 * of a bidirectional connection called a "socket".
 * 
 * This module defines one class, Client. To make a connection to a server,
 * create an instance of Client (using new), set up listeners,
 * and invoke the send() function to send a message.
 *
 * This module also provides two utility functions that return arrays
 * of MIME types supported for sending or receiving messages.
 * Specifying a message type facilitates conversion between the byte
 * streams transported over the socket and JavaScript objects that
 * are passed to send() or emitted as a 'message' event.
 *
 * @module webSocketClient
 * @author Edward A. Lee
 * @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals exports, Java, require, util */
/*jshint globalstrict: true */
"use strict";

var EventEmitter = require('events').EventEmitter;

///////////////////////////////////////////////////////////////////////////////
//// supportedReceiveTypes

/** Return an array of the types supported by the current host for
 *  receiveType arguments.
 */
exports.supportedReceiveTypes = function () {
    return ['application/json', 'text/plain'];
};

///////////////////////////////////////////////////////////////////////////////
//// supportedSendTypes

/** Return an array of the types supported by the current host for
 *  sendType arguments.
 */
exports.supportedSendTypes = function () {
    return ['application/json', 'text/plain'];
};

///////////////////////////////////////////////////////////////////////////////
//// Client

/** Construct an instance of a socket client that can send or receive messages
 *  to a server at the specified host and port.
 *  The returned object subclasses EventEmitter.
 *  You can register handlers for events 'open', 'message', 'close', or 'error'.
 *  The event 'open' will be emitted when the socket has been successfully opened.
 *  The event 'message' will be emitted with the body of the message as an
 *  argument when an incoming message arrives on the socket.
 *  You can invoke the send() function to send data to the server.
 *
 *  The type of data sent and received can be specified with the 'sendType'
 *  and 'receiveType' options.
 *  In principle, any MIME type can be specified, but the host may support only
 *  a subset of MIME types.  The client and the server have to agree on the type,
 *  or the data will not get through correctly.
 *
 *  The default type for both sending and receiving
 *  is 'application/json'. The types supported by this implementation
 *  include at least:
 *  * __application/json__: The this.send() function uses JSON.stringify() and sends the
 *    result with a UTF-8 encoding. An incoming byte stream will be parsed as JSON,
 *    and if the parsing fails, will be provided as a string interpretation of the byte
 *    stream.
 *  * __text/plain__: Any text type is sent as a string encoded in UTF-8.
 *  
 *  The event 'close' will be emitted when the socket is closed, and 'error' if an
 *  an error occurs (with an error message as an argument).
 *  For example,
 *  
 *  <pre>
 *      var webSocket = require('webSocketClient');
 *      var client = new webSocket.Client({'host': 'localhost', 'port': 8080});
 *      client.send({'foo': 'bar'});
 *      client.on('message', function(message) {
 *          console.log('Received from web socket: ' + message);
 *      });
 *      client.open();
 *  </pre>
 *  
 *  The above code may send a message even before the socket is opened. This module
 *  implementation will queue that message to be sent later when the socket is opened.
 *
 *  This will throw an exception if the browser does not support web sockets.
 *  
 *  The options argument is a JSON object that can contain the following properties:
 *  * host: The IP address or host name for the host. Defaults to 'localhost'.
 *  * port: The port on which the host is listening. Defaults to 80.
 *  * receiveType: The MIME type for incoming messages, which defaults to 'application/json'.
 *  * sendType: The MIME type for outgoing messages, which defaults to 'application/json'.
 *  * connectTimeout: The time to wait before giving up on a connection, in milliseconds
 *    (defaults to 1000).
 *  * numberOfRetries: The number of times to retry connecting. Defaults to 10.
 *  * timeBetweenRetries: The time between retries, in milliseconds. Defaults to 500.
 *  * discardMessagesBeforeOpen: If true, discard messages before the socket is open. Defaults to false.
 *  * throttleFactor: The number milliseconds to stall for each item that is queued waiting to be sent. Defaults to 0.
 *
 *  @param options The options.
 */
exports.Client = function (options) {
	EventEmitter.call(this);
	
    if (!('WebSocket' in window)) {
        throw 'Browser does not support web sockets.';
    }

    options = options || {};
    this.port = options.port || 80;
    this.host = options.host || 'localhost';
    this.receiveType = options.receiveType || 'application/json';
    this.sendType = options.sendType || 'application/json';
    this.connectTimeout = options.connectTimeout || 1000;
    this.numberOfRetries = options.numberOfRetries || 10;
    this.timeBetweenRetries = options.timeBetweenRetries || 500;
    this.discardMessagesBeforeOpen = options.discardMessagesBeforeOpen || false;
    this.throttleFactor = options.throttleFactor || 0;
    
    this.webSocket = null;
};
util.inherits(exports.Client, EventEmitter);

/** Open the socket connection. Call this after setting up event handlers.
 *  If the websocket is already open, do nothing.
 */
exports.Client.prototype.open = function () {
    if(!this.webSocket || this.webSocket.readyState != this.webSocket.OPEN) {
        // FIXME: Need to support SSL/TLS to allow 'wss' instead of 'ws'.
        // FIXME: Need to support retries.
        this.webSocket = new WebSocket('ws://' + this.host + ':' + this.port);
        var self = this;
        this.webSocket.onopen = function() {
            self.emit('open');
        };
        this.webSocket.onmessage = function(message) {
            var reader = new FileReader();
            reader.addEventListener("loadend", function() {
                // reader.result contains the contents of blob as text
                if (self.receiveType == 'application/json') {
                    try {
                        self.emit('message', JSON.parse(reader.result));
                    } catch(err) {
                        self.emit('message', 'Expected JSON. Failed to parse: ' + reader.result);
                    }
                } else {
                    self.emit('message', reader.result);
                }
            });
            reader.readAsText(message.data);
        };
        this.webSocket.onerror = function(message) {
            self.emit('error', message);
        };
        this.webSocket.onclose = function() {
            self.emit('close');
        };
    }
};

/** Send data over the web socket.
 *  If the socket has not yet been successfully opened, then queue
 *  data to be sent later, when the socket is opened.
 *  @param data The data to send.
 */
exports.Client.prototype.send = function (data) {
    // FIXME: Needs to support queuing of messages.
    if(!this.webSocket || this.webSocket.readyState != this.webSocket.OPEN) {
        if (!this.discardMessagesBeforeOpen) {
            throw 'Web socket is not open.';
        }
    }
    if (this.sendType == 'application/json') {
        this.webSocket.send(JSON.stringify(data));
    } else if (this.sendType.search(/text\//) === 0) {
        this.webSocket.send(data.toString());
    } else {
        this.webSocket.send(data);
    }
};

/** Close the current connection with the server.
 *  If there is data that was passed to this.send() but has not yet
 *  been successfully sent (because the socket was not open),
 *  then those messages will be lost and reported in an error message.
 */
exports.Client.prototype.close = function () {
    if(this.webSocket) {
        this.webSocket.close();
    }
};
