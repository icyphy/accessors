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

/** This accessor sends and/or receives messages from a web socket at
 *  the specified host and port. In `initialize()`, it
 *  begins connecting to the web socket server.
 *  Once the connection is established, a `true` boolean is sent to
 *  the `connected` output.
 *  If connection is not established immediately, the accessor will attempt to
 *  reconnect (numberOfRetries) times at an interval of (reconnectInterval)
 *
 *  Whenever an input is received on the `toSend`
 *  input, the message is sent to the socket. If the socket is not yet open,
 *  this accessor will, by default, queue the message to send when the socket opens,
 *  unless the `discardMessagesBeforeOpen` parameter is true, in which case,
 *  input messages that are received before the socket is opened will be
 *  discarded. If messages are queued and `throttleFactor` is non-zero, then
 *  whenever a message is queued to be later sent, the accessor's input handler will stall
 *  by a number of milliseconds given by the queue size times the throttleFactor.
 *  The longer the queue, the longer the stall. Note that this will likely block
 *  the host from executing, so this feature should be used with caution.
 *
 *  Whenever a message is received from the socket, that message is
 *  produced on the `'received'` output. Note that the message may actually be sent
 *  over multiple 'frames', but the frames will be aggregated and produced as one
 *  message.
 *
 *  When `wrapup()` is invoked, this accessor closes the
 *  connection.
 *
 *  If the connection is dropped midway, the client will attempt to reconnect if
 *  (reconnectOnClose) is true. This does not apply when the accessor wraps up.
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
 *  When a model with an instance of this accessor stops executing, there
 *  are two mechanisms by which data in transit can be lost. In both cases, warning
 *  messages or error messages will be issued to the host to be displayed or otherwise
 *  handled as the host sees fit.
 *
 *  * First, there might be queued messages that were received on `toSend` but have not yet
 *    been sent, either because the socket has not yet been opened or because
 *    it was closed from the other side.
 *  * Second, a message might be received from the server after shutdown has commenced.
 *    In particular, received messages are handled asynchronously by a handler function
 *    that can be invoked at any time, and that handler might be invoked after it is no
 *    longer possible for this accessor to produce outputs (it has entered its wrapup
 *    phase of execution).
 *
 *  The server might similarly lose messages by the same two mechanisms occurring
 *  on the server side. In that case, messages will presumably be displayed on the
 *  server side.
 *
 *  Accessors that extend this one can override the `toSendInputHandler` function
 *  to customize what is sent. See `RosPublisher.js` for an example.
 *
 *  This accessor requires the 'webSocket' module.
 *
 *  @accessor net/WebSocketClient
 *  @parameter {string} server The IP address or domain name of server. Defaults to 'localhost'.
 *  @parameter {int} port The port that the web socket listens to. Defaults to 8080.
 *  @parameter {string} receiveType The MIME type for incoming messages, which defaults to 'application/json'.
 *  @parameter {string} sendType The MIME type for outgoing messages, which defaults to 'application/json'.
 *  @parameter {int} connectTimeout The time in milliseconds to wait before giving up on a connection (default is 60000).
 *  @parameter {int} numberOfRetries The number of times to retry if a connection fails. Defaults to 5.
 *  @parameter {int} timeBetweenRetries The time between retries in milliseconds. Defaults to 100.
 *  @parameter {boolean} reconnectOnClose The option of whether or not to reconnect when disconnected.
 *  @parameter {boolean} discardMessagesBeforeOpen If true, then any messages received on `toSend` before the socket is open will be discarded. This defaults to false.
 *  @parameter {int} throttleFactor If non-zero, specifies a time (in milliseconds) to stall when a message is queued because the socket is not yet open. The time of the stall will be the queue size (after adding the message) times the throttleFactor. This defaults to 100. Making it non-zero causes the input handler to take time if there are pending unsent messages.
 *  @input toSend The data to be sent over the socket.
 *  @output {boolean} connected Output `true` on connected and `false` on disconnected.
 *  @output received The data received from the web socket server.
 *  @author Hokeun Kim, Marcus Pan, Edward A. Lee, Matt Weber
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global addInputHandler, console, error, exports, get, getParameter, input, onClose, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true*/
'use strict';

var WebSocket = require('webSocket');
var client = null;
var inputHandle = null;

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function () {
    parameter('server', {
        type : 'string',
        value : 'localhost'
    });
    parameter('port', {
        type : 'int',
        value : 8080
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
    parameter('connectTimeout', {
        value: 60000,
        type: "int"
    });
    parameter('numberOfRetries', {
        type : 'int',
        value : 5
    });
    parameter('timeBetweenRetries', {
        type : 'int',
        value : 100
    });
    parameter('reconnectOnClose', {
        type : 'boolean',
        value : true
    });
    parameter('discardMessagesBeforeOpen', {
        type : 'boolean',
        value : false
    });
    parameter('throttleFactor', {
        type : 'int',
        value : 100
    });
    input('toSend');
    output('connected', {
        type : 'boolean'
    });
    output('received');
};

/** Initializes accessor by attaching functions to inputs. */
exports.initialize = function () {

    //record the object that calls it (could be a derived accessor).
    var callObj = this;

    client = new WebSocket.Client(
        {
            'host' : getParameter('server'),
            'port' : getParameter('port'),
            'receiveType' : getParameter('receiveType'),
            'sendType' : getParameter('sendType'),
            'connectTimeout' : getParameter('connectTimeout'),
            'numberOfRetries' : getParameter('numberOfRetries'),
            'timeBetweenRetries' : getParameter('timeBetweenRetries'),
            'discardMessagesBeforeOpen' : getParameter('discardMessagesBeforeOpen'),
            'throttleFactor' : getParameter('throttleFactor')
        }
    );

    client.on('open', this.onOpen);
    client.on('message', this.onMessage);

    //bind onClose() to caller's object,
    //so initialize() of caller's object is called if reconnect is true.
    client.on('close', onClose.bind(callObj));
    client.on('error', function (message) {
        console.log(message);
    });
    //only execute once, and not when trying to reconnect.
    if (inputHandle === null) {
        inputHandle = addInputHandler('toSend', this.toSendInputHandler);
    }
};

/** Handles input on 'toSend'. */
exports.toSendInputHandler = function () {
    exports.sendToWebSocket(get('toSend'));
};

/** Sends JSON data to the web socket. */
exports.sendToWebSocket = function (data) {
    if (client !== null) {
        client.send(data);
        // console.log("Sending to web socket: " + data);
    } else {
        console.log("Client is null. Could not send message: " + data);
    }
};

/** Executes once  web socket establishes a connection.
 *  Sets 'connected' output to true.
 */
exports.onOpen = function () {
    console.log('Status: Connection established');
    send('connected', true);
};

/** Send false to 'connected' output, and if 'reconnectOnClose'
 *  parameter evaluates to true and wrapup() has not been called,
 *  then invoke initialize().
 *  This will be called if either side closes the connection.
 *  @param message Possible message about the closure.
 */
function onClose(message) {
    console.log('Status: Connection closed: ' + message);
    if (inputHandle) {
        // wrapup() has not been called.
        // Probably the server closed the connection.
        send('connected', false);
        // Reconnect if reconnectOnClose is true.
        if (getParameter('reconnectOnClose')) {
            // Use 'this' rather than 'export' so initialize() can be overridden.
            this.initialize();
        } else {
            // Not set to reconnect on close.
            // Close and unregister everything.
            client.removeAllListeners('open');
            client.removeAllListeners('message');
            client.removeAllListeners('close');
            client = null;
        }
    }
}

/** Send the message received from web socket to the 'received' output. */
exports.onMessage = function (message) {
    send('received', message);
};

/** Export the isOpen() function */
exports.isOpen = function () {
    return client.isOpen();
};

/** Close the web socket connection. */
exports.wrapup = function () {
    if (inputHandle !== null) {
        removeInputHandler(inputHandle);
        inputHandle = null;
    }
    if (client) {
        client.removeAllListeners('open');
        client.removeAllListeners('message');
        client.removeAllListeners('close');
        client.close();
        console.log('Status: Connection closed in wrapup.');
        client = null;
    }
};
