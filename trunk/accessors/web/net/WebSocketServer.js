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
 *  output is produced with that message. The maxFrameSize parameter limits the size
 *  of received messages, and any attempt to send to this client a larger message
 *  will cause an error.
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
 *  * __application/json__: The send() function uses JSON.stringify() and sends the
 *    result with a UTF-8 encoding. An incoming byte stream will be parsed as JSON,
 *    and if the parsing fails, will be provided as a string interpretation of the byte
 *    stream.
 *  * __text/\*__: Any text type is sent as a string encoded in UTF-8.
 *  * __image/x__: Where __x__ is one of __json__, __png__, __gif__,
 *    and more.
 *    In this case, the data passed to send() is assumed to be an image, as encoded
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
 *  @parameter {string} receiveType The MIME type for incoming messages, which defaults to 'application/json'.
 *  @parameter {string} sendType The MIME type for outgoing messages, which defaults to 'application/json'.
 *  @parameter {int} maxFrameSize The maximum frame size for a received message (default is 65536).
 *  @input toSend The data to be sent to open sockets. If this is an object with 'socketID' field and a 'message' field, then send the value of the message field to the socket identified by the socketID field. If the input has any other form, then the message is broadcast to all open socket connections.
 *  @output connection An output produced when a connection opens or closes. The output is an object with two fields, a 'socketID', which is a unique ID for this client connection, and a 'status' field, which is the string 'open' or 'closed'.
 *  @output received A message received a client in the form of an object with two fields, a 'socketID', which is a unique ID for this client connection, and a 'message' field, which is the message received from the client.
 *  @author Hokeun Kim, Edward Lee 
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, console, get, getParameter, error, exports, input, output, removeInputHandler, require, parameter, send */
/*jshint globalstrict: true*/
//'use strict';

var WebSocket = require('webSocket');
var server = null;
var running = false;

/** Sets up the accessor by defining inputs and outputs. */
exports.setup = function() {
    parameter('hostInterface', {
        value: "localhost",
        type: "string"
    });
    parameter('port', {
        value: 8080,
        type: "int"
    });
    parameter('receiveType', {
        type : 'string',
        value : 'application/json',
        options : WebSocket.supportedReceiveTypes()
    });
    parameter('sendType', {
        type : 'string',
        value : 'application/json',
        options : WebSocket.supportedSendTypes()
    });
    parameter('maxFrameSize', {
        value: 65536,
        type: "int"
    });
    input('toSend');
    output('received');
    output('connection');
};

var handle;
var sockets = [];

/** Starts the web socket and attaches functions to inputs and outputs.
  * Adds an input handler on toSend that sends the input received to the right socket. */
exports.initialize = function() {
    if (!server) {
        server = new WebSocket.Server({
                'port':getParameter('port'),
                'hostInterface':getParameter('hostInterface'),
                'receiveType':getParameter('receiveType'),
                'sendType':getParameter('sendType'),
                'maxFrameSize':getParameter('maxFrameSize')
        });
        server.on('listening', onListening);
        server.on('connection', onConnection);
        server.on('error', function (message) {
            error(message);
        });
        server.start();
    }
    running = true;

    handle = addInputHandler('toSend', function() {
        var data = get('toSend');
        // Careful: Don't do if (data) because if data === 0, then data is false.
        if (data !== null) {
            // Careful: if we do data.socketID !== null, then $PTII/org/terraswarm/accessor/test/auto/WebSocketClient.xml will fail.
            if ((data.socketID != null)  && (d ata.message !== null)) {
                // data has the right form for a point-to-point send.
                if (sockets[data.socketID] && sockets[data.socketID].isOpen()) {
                    // id matches this socket.
                    console.log("Sending to socket id " +
                                data.socketID +
                                " message: " +
                                data.message);
                    sockets[data.socketID].send(data.message);
                } else {
                    console.log('Socket with ID ' + data.socketID +
                                ' is not open. Discarding message: ' + data.message);
                }
            } else {
                // No socketID or message, so this is a broadcast message.
                // var success = false;
                for (var id = 0; id < sockets.length; id++) {
                    if (sockets[id].isOpen()) {
                        // console.log("Broadcasting to socket id " + id
                        //         + " message: " + data);
                        sockets[id].send(data);
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

function onListening() {
    console.log('Server: Listening for socket connection requests.');
}

/** Executes when a connection has been establised.<br>
 *  Triggers an output on <code>'connection'</code>.
 *  Adds an event listener to the socket. */
function onConnection(socket) {
   //socketID is the index of the socket in the sockets array.
    var socketID = sockets.length;
    console.log('Server: new socket established with ID: ' + socketID);
    send('connection', {'socketID':socketID, 'status':'open'});
    socket.on('message', function(message) {
        send('received', {'socketID':socketID, 'message':message});
    });
    socket.on('close', function(message) {
        send('connection', {'socketID':socketID, 'status':'closed'});
    });
    socket.on('error', function(message) {
        error(message);
    });

    sockets.push(socket);
}

/** Removes all inputHandlers from sockets.<br>
 * Unregisters event listeners from sockets.<br>
 * Closes server.
 */
exports.wrapup = function(){
    for (var i = 0; i < sockets.length; i++) {
        sockets[i].removeAllListeners();
    }

    sockets = [];
    removeInputHandler(handle);

    if (server !== null) {
        server.removeAllListeners();
        server.close();
        server = null;
    }
};
