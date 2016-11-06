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

/** This accessor starts a server that listens for web socket
 *  connection requests on the specified hostInterface and port.  The
 *  hostInterface is needed only if the host machine has more than one
 *  network interface (e.g. Ethernet and WiFi) and 'localhost' does
 *  not resolve to the desired interface.
 *
 *  The output `connection` reports the when a
 *  connection is opened or closed.
 *
 *  When a message arrives on a connection, a `received`
 *  output is produced with that message. Note that the message may arrive in
 *  multiple frames, but it will be produced as a single message.
 *
 *  When an input arrives on `toSend`, then a message is
 *  sent to one or all of the open socket connections.
 *
 *  When `wrapup()` is invoked, this accessor closes the
 *  server and all connections.
 *
 *  The default type for both sending and receiving
 *  is 'application/json', which allows sending and receiving anything that has
 *  a string representation in JSON. The types supported by this implementation
 *  include at least:
 *  * __application/json__: The this.send() function uses JSON.stringify() and sends the
 *    result with a UTF-8 encoding. An incoming byte stream will be parsed as JSON,
 *    and if the parsing fails, will be provided as a string interpretation of the byte
 *    stream.
 *  * __text/\*__: Any text type is sent as a string encoded in UTF-8.
 *  * __image/x__: Where __x__ is one of __json__, __png__, __gif__,
 *    and more.
 *    In this case, the data passed to this.send() is assumed to be an image, as encoded
 *    on the host, and the image will be encoded as a byte stream in the specified
 *    format before sending.  A received byte stream will be decoded as an image,
 *    if possible.
 *
 *  This accessor requires the module webSocket.
 *
 *  @accessor net/WebSocketServer
 *  @parameter {string} hostInterface The IP address or domain name of the
 *    network interface to listen to.
 *  @parameter {int} port The port to listen to for connections.
 *  @parameter {string} pfxKeyCertPassword If sslTls is set to true, then this option needs
 *   to specify the password for the pfx key-cert file specified by pfxKeyCertPath.
 *  @parameter {string} pfxKeyCertPath If sslTls is set to true, then this option needs to
 *   specify the fully qualified filename for the file that stores the private key and certificate 
 *   that this server will use to identify itself. This path can be any of those understood by the
 *   Ptolemy host, e.g. paths beginning with $CLASSPATH/.
 *  @parameter {string} receiveType The MIME type for incoming messages, 
 *    which defaults to 'application/json'.
 *  @parameter {string} sendType The MIME type for outgoing messages,
 *    which defaults to 'application/json'.
 *  @parameter {boolean} sslTls Whether SSL/TLS is enabled. This defaults to false.
 *  @input toSend The data to be sent to open sockets. 
 *    If this is an object with 'socketID' field and a 'message' field,
 *    then send the value of the message field to the socket identified
 *    by the socketID field. If the input has any other form, then the
 *    message is broadcast to all open socket connections.
 *  @output {int} listening When the server is listening for connections, this output
 *    will produce the port number that the server is listening on
 *  @output connection An output produced when a connection opens or closes.
 *    The output is an object with two fields, a 'socketID',
 *    which is a unique ID for this client connection, and a 'status' field,
 *    which is the string 'open' or 'closed'.
 *  @output received A message received a client in the form of an object with two fields, a 'socketID', which is a unique ID for this client connection, and a 'message' field, which is the message received from the client.
 *  @author Hokeun Kim, Edward Lee 
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
'use strict';
/*jslint plusplus: true */

var WebSocket = require('webSocketServer');
var server = null;
var running = false;

/** Sets up the accessor by defining inputs and outputs. */
exports.setup = function () {
    this.parameter('hostInterface', {
        value: "localhost",
        type: "string"
    });
    this.parameter('port', {
        value: 8080,
        type: "int"
    });
    this.parameter('pfxKeyCertPassword', {
        value: '',
        type: 'string'
    });
    this.parameter('pfxKeyCertPath', {
        value: '',
        type: 'string'
    });
    this.parameter('receiveType', {
        type : 'string',
        value : 'application/json',
    });
    this.parameter('sendType', {
        type : 'string',
        value : 'application/json',
    });
    this.parameter('sslTls', {
        type: 'boolean',
        value: false
    });
    this.input('toSend');
    this.output('received');
    this.output('listening', {'type': 'int'});
    this.output('connection', {'spontaneous': true});

    // Attempt to add a list of options for types, but do not error out
    // if the socket module is not supported by the host.
    try {
        this.parameter('receiveType', {
            options : WebSocket.supportedReceiveTypes()
        });
        this.parameter('sendType', {
            options : WebSocket.supportedSendTypes()
        });
    } catch (err) {
        error(err);
    }
};

//var sockets = [];

/** Starts the web socket and attaches functions to inputs and outputs.
 * Adds an input handler on toSend that sends the input received to the right socket. */
exports.initialize = function () {
    var self = this;
    self.sockets = [];
    
    if (!server) {
        server = new WebSocket.Server({
            'port': this.getParameter('port'),
            'hostInterface': this.getParameter('hostInterface'),
            'pfxKeyCertPassword': this.getParameter('pfxKeyCertPassword'),
            'pfxKeyCertPath': this.getParameter('pfxKeyCertPath'),
            'receiveType': this.getParameter('receiveType'),
            'sendType': this.getParameter('sendType'),
            'sslTls': this.getParameter('sslTls')
        });
        // Using 'this.exports' rather than just 'exports' in the following allows
        // these functions to be overridden in derived accessors.
        server.on('listening', this.exports.onListening.bind(this));
        server.on('connection', this.exports.onConnection.bind(this));
        server.on('error', function (message) {
            self.error(message);
        });
        server.start();
    }
    running = true;

    this.addInputHandler('toSend', function () {
        var data = self.get('toSend'), id;
        // Careful: Don't do if (data) because if data === 0, then data is false.
        if (data !== null) {

            // JSHint WARNING: Do not change dataSocketID != null to
            // data.socketID !== null because it will cause
            // org/terraswarm/accessor/test/auto/WebSocketClient.xml
            // to fail upon reloading.  See
            // org/terraswarm/accessor/test/WebSocketClientTest.tcl
            if ((data.socketID != null)  && (data.message !== null)) {
                // data has the right form for a point-to-point send.
                if (self.sockets[data.socketID] && self.sockets[data.socketID].isOpen()) {
                    // id matches this socket.
                    /*
                      console.log("Sending to socket id " +
                      data.socketID +
                      " message: " +
                      data.message);
                    */
                    self.sockets[data.socketID].send(data.message);
                } else {
                    console.log('Socket with ID ' + data.socketID +
                                ' is not open. Discarding message.');
                }
            } else {
                // No socketID or message, so this is a broadcast message.
                // var success = false;
                for (id = 0; id < self.sockets.length; id++) {
                    if (self.sockets[id].isOpen()) {
                        // console.log("Broadcasting to socket id " + id
                        //         + " message: " + data);
                        self.sockets[id].send(data);
                        // success = true;
                    }
                }
                // if (!success) {
                //     console.log('No open sockets. Discarding message: ' + data.message);
                // }
            }
        }
    });
};

exports.onListening = function () {
    console.log('Server: Listening for socket connection requests.');
    this.send('listening', this.getParameter('port'));
};

/** Executes when a connection has been establised.<br>
 *  Triggers an output on <code>'connection'</code>.
 *  Adds an event listener to the socket. */
exports.onConnection = function (socket) {
    // socketID is the index of the socket in the sockets array.
    var self = this, socketID = self.sockets.length;
    console.log('Server: new socket established with ID: ' + socketID);
    this.send('connection', {'socketID': socketID, 'status': 'open'});
    
    self.sockets.push(socket);
    
    self.sockets[socketID].on('message', function (message) {
    	// If message is a string, strip leading and trailing "
    	if (typeof message === 'string') {
    		message = message.replace(/^"(.*)"$/, '$1');
    	}
        self.send('received', {'message': message, 'socketID': socketID});
    });
    self.sockets[socketID].on('close', function () {
        self.send('connection', {'socketID': socketID, 'status': 'closed'});
    });
    self.sockets[socketID].on('error', function (message) {
    	console.log('error ' + message);
        self.error(message);
    });

    
};

/** Removes all inputHandlers from sockets.<br>
 * Unregisters event listeners from sockets.<br>
 * Closes server.
 */
exports.wrapup = function () {
    this.sockets = [];

    if (server !== null) {
        server.stop();
        server = null;
    }
};
