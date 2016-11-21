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
 *  the specified host and port.
 *  <a href="https://en.wikipedia.org/wiki/WebSocket">WebSockets</a>
 *  provide full-duplex communication channels over a single TCP/IP connection.
 *  In `initialize()`, it  begins connecting to the web socket server.
 *  Once the connection is established, a `true` boolean is sent to
 *  the `connected` output.
 *  If connection is not established immediately, the accessor will attempt to
 *  reconnect _numberOfRetries_ times at an interval of _reconnectInterval_.
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
 *  If the connection is dropped midway, the swarmlet may monitor the 'connected'
 *  output for a value 'false' and attempt a reconnection by providing either a
 *  port or server input.
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
 *  @input {string} server The IP address or domain name of server. Defaults to 'localhost'.
 *  @input {int} port The port on the server to connect to. Defaults to -1, which means
 *   wait for a non-negative input before connecting.
 *  @input toSend The data to be sent over the socket.
 *  @output {boolean} connected Output `true` on connected and `false` on disconnected.
 *  @output received The data received from the web socket server.
 *
 *  @parameter {string} receiveType The MIME type for incoming messages,
 *   which defaults to 'application/json'.
 *  @parameter {string} sendType The MIME type for outgoing messages,
 *   which defaults to 'application/json'.
 *  @parameter {int} connectTimeout The time in milliseconds to wait
 *   before giving up on a connection (default is 1000).
 *  @parameter {int} numberOfRetries The number of times to retry if
 *   a connection fails. Defaults to 5.
 *  @parameter {int} timeBetweenRetries The time between retries in milliseconds.
 *   Defaults to 500.
 *  @parameter {boolean} trustAll Whether to trust any server certificate.
 *   This defaults to false. Setting it to true means that if sslTls is set to true,
 *   then any certificate provided by the server will be trusted.
 *  @parameter {string} trustedCACertPath If sslTls is set to true and trustAll is set to false,
 *   then this option needs to specify the fully qualified filename for the file that stores
 *   the certificate of a certificate authority (CA) that this client will use to verify server
 *   certificates. This path can be any of those understood by the Ptolemy host, e.g. paths
 *   beginning with $CLASSPATH/.
 *   FIXME: Need to be a list of paths for certificates rather than a single path.
 *  @parameter {boolean} sslTls Whether SSL/TLS is enabled. This defaults to false.
 *  @parameter {boolean} discardMessagesBeforeOpen If true,
 *   then any messages received on `toSend` before the socket
 *   is open will be discarded. This defaults to false.
 *  @parameter {int} throttleFactor If non-zero, specifies a
 *   time (in milliseconds) to stall when a message is queued
 *   because the socket is not yet open. The time of the stall
 *   will be the queue size (after adding the message) times
 *   the throttleFactor. This defaults to 100. Making it non-zero
 *   causes the input handler to take time if there are pending unsent messages.

 *  @author Hokeun Kim, Marcus Pan, Edward A. Lee, Matt Weber
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global console, error, exports, require */
/*jshint globalstrict: true*/
'use strict';
/*jslint plusplus: true */

var WebSocket = require('webSocketClient');
var client = null;
var pendingSends = [];
var previousServer, previousPort;
var running = false;

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function () {
    this.input('server', {
        type : 'string',
        value : 'localhost'
    });
    this.input('port', {
        type : 'int',
        value : -1
    });
    this.input('toSend');
    this.output('connected', {
        type : 'boolean'
    });
    this.output('received');

    this.parameter('receiveType', {
        type : 'string',
        value : 'application/json'
    });
    this.parameter('sendType', {
        type : 'string',
        value : 'application/json'
    });
    this.parameter('connectTimeout', {
        value: 1000,
        type: "int"
    });
    this.parameter('numberOfRetries', {
        type : 'int',
        value : 5
    });
    this.parameter('timeBetweenRetries', {
        type : 'int',
        value : 500
    });
    this.parameter('trustAll', {
        type : 'boolean',
        value : false
    });
    this.parameter('trustedCACertPath', {
        type : 'string',
        value : ''
    });
    this.parameter('sslTls', {
        type : 'boolean',
        value : false
    });
    this.parameter('discardMessagesBeforeOpen', {
        type : 'boolean',
        value : false
    });
    this.parameter('throttleFactor', {
        type : 'int',
        value : 100
    });

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
        this.error(err);
    }
};

/** Set up input handlers, and if the current value of the 'port' input is
 *  non-negative, initiate a connection to the server using the
 *  current parameter values, and
 *  set up handlers for for establishment of the connection, incoming data,
 *  errors, and closing from the server.
 */
exports.initialize = function () {
    console.log("WebSocketClient.js: initialize()");
    this.addInputHandler('server', this.exports.connect.bind(this));
    this.addInputHandler('port', this.exports.connect.bind(this));
    this.addInputHandler('toSend', exports.toSendInputHandler.bind(this));
    running = true;
    this.exports.connect.call(this);
};

/** Initiate a connection to the server using the current parameter values,
 *  set up handlers for for establishment of the connection, incoming data,
 *  errors, and closing from the server, and set up a handler for inputs
 *  on the toSend() input port.
 */
exports.connect = function () {
    console.log("WebSocketClient.js: connect()");
    // Note that if 'server' and 'port' both receive new data in the same
    // reaction, then this will be invoked twice. But we only want to open
    // the socket once.  This is fairly tricky.

    var portValue = this.get('port'), serverValue = null;
    if (portValue < 0) {
        // No port is specified. This could be a signal to close a previously
        // open socket.
        if (client) {
            client.close();
        }
        previousPort = null;
        previousServer = null;
        //
        console.log("WebSocketClient.js: connect(): portValue: " + portValue +
                    ", which is less than 0. This could be a signal to close a previously open socket." +
                    "  Returning.");
        return;
    }

    serverValue = this.get('server');
    if (previousServer === serverValue && previousPort === portValue) {
        // A request to open a client for this server/port pair has already
        // been made and has not yet been closed or failed with an error.
        return;
    }
    // Record the host/port pair that we are now opening.
    previousServer = serverValue;
    previousPort = portValue;

    if (client) {
        // Either the host or the port has changed. Close the previous socket.
        client.close();
    }

    console.log("WebSocketClient.js: connect() calling new WebSocket.Client()");
    client = new WebSocket.Client(
        {
            'host' : this.get('server'),
            'port' : this.get('port'),
            'receiveType' : this.getParameter('receiveType'),
            'sendType' : this.getParameter('sendType'),
            'connectTimeout' : this.getParameter('connectTimeout'),
            'numberOfRetries' : this.getParameter('numberOfRetries'),
            'timeBetweenRetries' : this.getParameter('timeBetweenRetries'),
            'trustAll' : this.getParameter('trustAll'),
            'trustedCACertPath' : this.getParameter('trustedCACertPath'),
            'sslTls' : this.getParameter('sslTls'),
            'discardMessagesBeforeOpen' : this.getParameter('discardMessagesBeforeOpen'),
            'throttleFactor' : this.getParameter('throttleFactor')
        }
    );

    // Using 'this.exports' rather than just 'exports' below allows these
    // functions to be overridden in derived accessors.
    client.on('open', this.exports.onOpen.bind(this));
    client.on('message', this.exports.onMessage.bind(this));
    client.on('close', this.exports.onClose.bind(this));

    client.on('error', function (message) {
        previousServer = null;
        previousPort = null;
        console.log('Error: ' + message);
    });

    client.open();
    console.log("WebSocketClient.js: connect() done");
};

/** Handles input on 'toSend'. */
exports.toSendInputHandler = function () {
    this.exports.sendToWebSocket.call(this, this.get('toSend'));
};

/** Sends JSON data to the web socket. */
exports.sendToWebSocket = function (data) {
    // May be receiving inputs before client has been set.
    if (client) {
        client.send(data);
    } else {
        if (!this.getParameter('discardMessagesBeforeOpen')) {
            pendingSends.push(data);
        } else {
            console.log('Discarding data because socket is not open.');
        }
    }
};

/** Executes once  web socket establishes a connection.
 *  Sets 'connected' output to true.
 */
exports.onOpen = function () {
    var i;
    console.log('WebSocketClient.js: onOpen(): Status: Connection established');
    this.send('connected', true);

    // If there are pending sends, send them now.
    // Note this implementation requires that the host invoke
    // this callback function atomically w.r.t. the input handler
    // that adds messages to the pendingSends queue.
    for (i = 0; i < pendingSends.length; i += 1) {
        client.send(pendingSends[i]);
    }
    pendingSends = [];
};

/** Send false to 'connected' output.
 *  This will be called if either side closes the connection.
 */
exports.onClose = function () {
    previousServer = null;
    previousPort = null;

    console.log('WebSocketClient.js onClose(): Status: Connection closed.');

    // NOTE: Even if running is true, it can occur that it is too late
    // to send the message (the wrapup process has been started), in which case
    // the message may not be received.
    if (running) {
        this.send('connected', false);
    }
};

/** Send the message received from web socket to the 'received' output. */
exports.onMessage = function (message) {
    this.send('received', message);
};

/** Close the web socket connection. */
exports.wrapup = function () {
    running = false;
    if (client) {
        client.close();
        console.log('Status: Connection closed in wrapup.');
    }
};
