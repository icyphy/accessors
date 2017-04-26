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

/** This accessor sends and/or receives messages from a TCP socket at
 *  the specified host and port. If the value of the `port` input is initially
 *  negative, then this accessor waits until it receives a non-negative `port`
 *  input before making a connection. Otherwise,
 *  upon initialization, it initiates a connection to the
 *  specified server. If at any time during execution it receives
 *  a 'port' input, then it will close any open socket and, if the new
 *  'port' value is non-negative, open
 *  a new socket to the current 'host' and 'port'.
 *
 *  When the connection is established, a `true` boolean is sent to
 *  the `connected` output. If the connection is broken during execution, then a `false`
 *  boolean is sent to the `connected` output. The swarmlet could respond to this by
 *  retrying to connect (send an event to either the `port` or `host` input).
 *
 *  Whenever an input is received on the `toSend` input,
 *  the data on that input is sent to the socket. If the socket is not yet open,
 *  this accessor will, by default, queue the message to send when a socket next opens,
 *  unless the `discardMessagesBeforeOpen` parameter is true, in which case,
 *  input messages that are received before the socket is opened will be
 *  discarded.
 *
 *  Whenever a message is received from the socket, that message is
 *  produced on the `received` output.
 *
 *  When `wrapup()` is invoked, this accessor closes the  connection.
 *
 *  The send and receive types can be any of those supported by the host.
 *  The list of supported types will be provided as options for the `sendType`
 *  and `receiveType` parameter. For the Ptolemy II host, these include at
 *  least 'string', 'number', 'image', and a variety of numeric types.
 *
 *  If both ends of the socket are known to be JavaScript clients,
 *  then you should use the 'number' data type for numeric data.
 *  If one end or the other is not JavaScript, then
 *  you can use more specified types such as 'float' or 'int', if they
 *  are supported by the host. In all cases, received numeric
 *  data will be converted to JavaScript 'number' when emitted.
 *  For sent data, this will try to convert a JavaScript number
 *  to the specified type. The type 'number' is equivalent
 *  to 'double'.
 *
 *  When type conversions are needed, e.g. when you send a double
 *  with `sendType` set to int, or an int with `sendType` set to byte,
 *  then a "primitive narrowing conversion" will be applied, as specified here:
 *  https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html#jls-5.1.3 .
 *
 *  For numeric types, you can also send an array all at once by providing an
 *  array to the `toSend` input port.
 *  The elements of the array will be sent in sequence all
 *  at once, and may be received in one batch. If both ends have
 *  `rawBytes` set to false (specifying message framing), then these
 *  elements will be emitted at the receiving end all at once in a single
 *  array. Otherwise, they will be emitted one at a time.
 *
 *  For strings, you can also send an array of strings in a single call,
 *  but these will be simply be concatenated and received as a single string.
 *
 *  If the `rawBytes` option is set to false, then each data item provided on `toSend`,
 *  of any type or array of types, will be coalesced into a single message and
 *  the receiving end (if it also has `rawBytes` set to false) will emit the entire
 *  message, and only the message, exactly once.  Otherwise, a message may get
 *  fragmented, emitted in pieces, or coalesced with subsequent messages.
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
 *
 *  The server might similarly lose messages by the same two mechanisms occurring
 *  on the server side. In that case, messages will presumably be displayed on the
 *  server side.
 *
 *  Accessors that extend this one can override the `toSendInputHandler` function
 *  to customize what is sent.
 *
 *  This accessor requires the 'socket' module.
 *
 *  @accessor net/TCPSocketClient
 *
 *  @input {string} host The IP address or domain name of server. Defaults to 'localhost'.
 *  @input {int} port The port on the server to connect to. Defaults to -1, which means
 *   wait for a non-negative input before connecting.
 *  @input toSend The data to be sent over the socket.
 *  @output {boolean} connected Output `true` on connected and `false` on disconnected.
 *  @output received The data received from the web socket server.
 *
 *  @parameter {int} connectTimeout The time to wait (in milliseconds) before declaring
 *    a connection attempt to have failed. This defaults to 6000.
 *  @parameter {int} idleTimeout The amount of idle time in seconds that will cause
 *    a disconnection of a socket. This defaults to 0, which means no
 *    timeout.
 *  @parameter {boolean} discardMessagesBeforeOpen If true, then discard any messages
 *    passed to SocketClient.send() before the socket is opened. If false,
 *    then queue the messages to be sent when the socket opens. This
 *    defaults to false.
 *  @parameter {boolean} keepAlive Whether to keep a connection alive and reuse it. This
 *    defaults to true.
 *  @parameter {int} maxUnsentMessages The maximum number of unsent messages to queue before
 *    further calls to this.send() will fail. A value of 0 means no limit.
 *    This defaults to 100.
 *  @parameter {boolean} noDelay If true, data as sent as soon as it is available (the default).
 *    If false, data may be accumulated until a reasonable packet size is formed
 *    in order to make more efficient use of the network (using Nagle's algorithm).
 *  @parameter {string} pfxKeyCertPassword If sslTls is set to true and the server requires
 *    client authentication, then this option needs to specify the password for the pfx key-cert
 *    file specified by pfxKeyCertPath.
 *  @parameter {string} pfxKeyCertPath If sslTls is set to true and the server requires
 *    client authentication, then this option needs to specify the fully qualified filename for
 *    the file that stores the private key and certificate that this client will use to authenticate
 *    itself to the server. This path can be any of those understood by the Ptolemy host,
 *    e.g. paths beginning with $CLASSPATH/.
 *  @parameter {boolean} rawBytes If true (the default), then transmit only the data bytes provided
 *    to this.send() without any header. If false, then prepend sent data with length
 *    information and assume receive data starts with length information.
 *    Setting this false on both ends will ensure that each data item passed to
 *    this.send() is emitted once in its entirety at the receiving end, as a single
 *    message. When this is false, the receiving end can emit a partially received
 *    message or could concatenate two messages and emit them together.
 *  @parameter {int} receiveBufferSize The size of the receive buffer. Defaults to
 *    65536.
 *  @parameter {string} receiveType See above.
 *  @parameter {int} reconnectAttempts The number of times to try to reconnect.
 *    If this is greater than 0, then a failure to attempt will trigger
 *    additional attempts. This defaults to 10.
 *  @parameter {int} reconnectInterval The time between reconnect attempts, in
 *    milliseconds. This defaults to 1000 (1 second).
 *  @parameter {int} sendBufferSize The size of the receive buffer. Defaults to
 *    65536.
 *  @parameter {string} sendType See above.
 *  @parameter {boolean} sslTls Whether SSL/TLS is enabled. This defaults to false.
 *  @parameter {boolean} trustAll Whether to trust servers. This defaults to false.
 *    Setting it to true means that if sslTls is set to true, then
 *    any certificate provided by the server will be trusted.
 *    FIXME: Need to provide a trusted list if this is false.
 *  @parameter {string} trustedCACertPath If sslTls is set to true and trustAll is
 *    set to false, then this option needs to specify the fully qualified filename
 *    for the file that stores the certificate of a certificate authority (CA) that
 *    this client will use to verify server certificates. This path can be any of those
 *    understood by the Ptolemy host, e.g. paths beginning with $CLASSPATH/.
 *    FIXME: Need to be a list of paths for certificates rather than a single path.
 *
 *  @author Edward A. Lee, Hokeun Kim, Contributor: Matt Weber
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, error, exports, getParameter, require */
/*jshint globalstrict: true */
"use strict";

var socket = require('socket');
var openSocket = false; // state variable used for isOpen function.
var client = null;
var running = false;
var pendingSends = [];
var previousHost, previousPort;

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function () {
    this.input('host', {
        type: 'string',
        value: 'localhost'
    });
    this.input('port', {
        type: 'int',
        value: -1
    });
    // This input is added after host and port so that if there are
    // simultaneous inputs, host and port are handled first.
    this.input('toSend');

    this.output('connected', {
        type: 'boolean'
    });
    this.output('received');

    // The parameters are in alphabetical order.
    this.parameter('connectTimeout', {
        value: 6000,
        type: "int"
    });
    this.parameter('discardMessagesBeforeOpen', {
        type: 'boolean',
        value: false
    });
    this.parameter('idleTimeout', {
        value: 0,
        type: "int"
    });
    this.parameter('keepAlive', {
        type: 'boolean',
        value: true
    });
    this.parameter('maxUnsentMessages', {
        value: 100,
        type: "int"
    });
    this.parameter('noDelay', {
        type: 'boolean',
        value: true
    });
    this.parameter('pfxKeyCertPassword', {
        type: 'string',
        value: ''
    });
    this.parameter('pfxKeyCertPath', {
        type: 'string',
        value: ''
    });
    this.parameter('rawBytes', {
        type: 'boolean',
        value: false
    });
    this.parameter('receiveBufferSize', {
        value: 65536,
        type: "int"
    });
    this.parameter('receiveType', {
        type: 'string',
        value: 'string'
    });
    this.parameter('reconnectAttempts', {
        type: 'int',
        value: 10
    });
    this.parameter('reconnectInterval', {
        type: 'int',
        value: 1000
    });
    this.parameter('sendBufferSize', {
        value: 65536,
        type: "int"
    });
    this.parameter('sendType', {
        type: 'string',
        value: 'string'
    });
    this.parameter('sslTls', {
        type: 'boolean',
        value: false
    });
    this.parameter('trustAll', {
        type: 'boolean',
        value: false
    });
    this.parameter('trustedCACertPath', {
        type: 'string',
        value: ''
    });

    // Attempt to add a list of options for types, but do not error out
    // if the socket module is not supported by the host.
    try {
        this.parameter('receiveType', {
            options: socket.supportedReceiveTypes()
        });
        this.parameter('sendType', {
            options: socket.supportedSendTypes()
        });
    } catch (err) {
        this.error(err);
    }
};


/** Send the specified data if the client is set and open,
 *  reconnect the client if the socket is closed, and otherwise either
 *  discard or queue the data to send later depending on the value of
 *  `discardMessagesBeforeOpen`.
 */
exports.send = function (data) {
    // May be receiving inputs before client has been set.

    if (client && exports.isOpen()) {
        client.send(data);
    } else {
        if (client) {
            // In case the server has closed the socket, reconnect.
            this.exports.connect.call(this);
            client.send(data);
        } else {
            if (!getParameter('discardMessagesBeforeOpen')) {
                var maxUnsentMessages = getParameter('maxUnsentMessages');

                if (maxUnsentMessages > 0 && pendingSends.length >= maxUnsentMessages) {
                    this.error("Maximum number of unsent messages has been exceeded: " +
                        maxUnsentMessages +
                        ". Consider setting discardMessagesBeforeOpen to true.");
                    return;
                }
                pendingSends.push(data);
            } else {
                console.log('Discarding data because TCP Socket Client has not yet been set up.');
            }
        }
    }
};

/** Handle input on 'toSend' by sending the specified data to the server. */
exports.toSendInputHandler = function () {
    this.exports.send.call(this, this.get('toSend'));
};

/** Set up input handlers, and if the current value of the 'port' input is
 *  non-negative, initiate a connection to the server using the
 *  current parameter values, and
 *  set up handlers for for establishment of the connection, incoming data,
 *  errors, and closing from the server.
 */
exports.initialize = function () {
    this.addInputHandler('host', this.exports.connect.bind(this));
    this.addInputHandler('port', this.exports.connect.bind(this));
    this.addInputHandler('toSend', this.exports.toSendInputHandler.bind(this));
    this.exports.connect.call(this);
    running = true;
};


/** Function is called by client when data has been received over the connection.
 *   This has been refactored out of exports.connect to facilitate overriding by an
 *   extending accessor.
 */
exports.dataReceivedHandler = function (data) {
    this.send('received', data);
};

/** Initiate a connection to the server using the current parameter values,
 *  set up handlers for for establishment of the connection, incoming data,
 *  errors, and closing from the server, and set up a handler for inputs
 *  on the toSend() input port.
 */
exports.connect = function () {
    // Note that if 'host' and 'port' both receive new data in the same
    // reaction, then this will be invoked twice. But we only want to open
    // the socket once.  This is fairly tricky.

    var portValue = this.get('port');
    if (portValue < 0) {
        // No port is specified. This could be a signal to close a previously
        // open socket.
        if (client && exports.isOpen()) {
            client.close();
        }
        previousPort = null;
        previousHost = null;
        return;
    }

    var hostValue = this.get('host');
    if (previousHost === hostValue && previousPort === portValue) {
        // A request to open a client for this host/port pair has already
        // been made and has not yet been closed or failed with an error.
        return;
    }
    // Record the host/port pair that we are now opening.
    previousHost = hostValue;
    previousPort = portValue;

    if (client && exports.isOpen()) {
        // Either the host or the port has changed. Close the previous socket.
        client.close();
    }
    // Create a new SocketClient.
    client = new socket.SocketClient(portValue, hostValue, {
        'connectTimeout': this.getParameter('connectTimeout'),
        'discardMessagesBeforeOpen': this.getParameter('discardMessagesBeforeOpen'),
        'idleTimeout': this.getParameter('idleTimeout'),
        'keepAlive': this.getParameter('keepAlive'),
        'maxUnsentMessages': this.getParameter('maxUnsentMessages'),
        'noDelay': this.getParameter('noDelay'),
        'pfxKeyCertPassword': this.getParameter('pfxKeyCertPassword'),
        'pfxKeyCertPath': this.getParameter('pfxKeyCertPath'),
        'rawBytes': this.getParameter('rawBytes'),
        'receiveBufferSize': this.getParameter('receiveBufferSize'),
        'receiveType': this.getParameter('receiveType'),
        'reconnectAttempts': this.getParameter('reconnectAttempts'),
        'reconnectInterval': this.getParameter('reconnectInterval'),
        'sendBufferSize': this.getParameter('sendBufferSize'),
        'sendType': this.getParameter('sendType'),
        'sslTls': this.getParameter('sslTls'),
        'trustAll': this.getParameter('trustAll'),
        'trustedCACertPath': this.getParameter('trustedCACertPath')
    });

    var self = this;

    client.on('open', function () {
        console.log('Status: Connection established');
        self.send('connected', true);

        // If there are pending sends, send them now.
        // Note this implementation requires that the host invoke
        // this callback function atomically w.r.t. the input handler
        // that adds messages to the pendingSends queue.
        for (var i = 0; i < pendingSends.length; i++) {
            client.send(pendingSends[i]);
        }
        pendingSends = [];
        openSocket = true; //Update state variable
    });
    client.on('data', self.exports.dataReceivedHandler.bind(self));
    client.on('close', function () {
        previousHost = null;
        previousPort = null;
        console.log('Connection closed.');
        // NOTE: Even if running is true, it can occur that it is too late
        // to send the message (the wrapup process has been started), in which case
        // the message may not be received.
        if (running) {
            self.send('connected', false);
        }
        openSocket = false; //Update state variable
    });
    client.on('error', function (message) {
        previousHost = null;
        previousPort = null;
        self.error(message);
    });

    client.open();
};

/** Return true if this client has an open connection to the server. */
exports.isOpen = function () {
    return openSocket;
};

/** Close the web socket connection. */
exports.wrapup = function () {
    running = false;
    if (client) {
        client.close();
        console.log('Status: Connection closed in wrapup.');
    }
};
