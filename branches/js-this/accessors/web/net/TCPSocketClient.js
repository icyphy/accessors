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

/** This accessor sends and/or receives messages from a TCP socket at
 *  the specified host and port. Upon initialization, it initiates a connection to the
 *  specified server. When the connection is established, a `true` boolean is sent to
 *  the `connected` output.
 *
 *  Whenever an input is received on the `toSend` input,
 *  the data on that input is sent to the socket. If the socket is not yet open,
 *  this accessor will, by default, queue the message to send when the socket opens,
 *  unless the `discardMessagesBeforeOpen` parameter is true, in which case,
 *  input messages that are received before the socket is opened will be
 *  discarded.
 *
 *  Whenever a message is received from the socket, that message is
 *  produced on the `received` output.
 *
 *  When `wrapup()` is invoked, this accessor closes the
 *  connection.
 *
 *  If the connection is dropped midway, the client will attempt to reconnect if
 *  `reconnectOnClose` is true. This does not apply after the accessor wraps up.
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
 *  For numeric types, you can also send an array with a single call
 *  to this.send(). The elements of the array will be sent in sequence all
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
 *  @input toSend The data to be sent over the socket.
 *  @output {boolean} connected Output `true` on connected and `false` on disconnected.
 *  @output received The data received from the web socket server.
 *
 *  @parameter {string} host The IP address or domain name of server. Defaults to 'localhost'.
 *  @parameter {int} port The port on the server to connect to. Defaults to 4000.
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
 *  @parameter {boolean} reconnectOnClose If true, then if the connection is closed
 *    before this accessor is wrapped up, then attempt to reconnect.
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
 *  @author Edward A. Lee, Hokeun Kim
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, error, exports */
/*jshint globalstrict: true */
"use strict";

var socket = require('socket');
var client = null;

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function () {
    this.input('toSend');
    this.output('connected', {
        type : 'boolean'
    });
    this.output('received');

    // The most used parameters are listed first.
    this.parameter('host', {
        type : 'string',
        value : 'localhost'
    });
    this.parameter('port', {
        type : 'int',
        value : 4000
    });
    
    // The remaining parameters are in alphabetical order.
    this.parameter('connectTimeout', {
        value: 6000,
        type: "int"
    });
    this.parameter('discardMessagesBeforeOpen', {
        type : 'boolean',
        value : false
    });
    this.parameter('idleTimeout', {
        value: 0,
        type: "int"
    });
    this.parameter('keepAlive', {
        type : 'boolean',
        value : true
    });
    this.parameter('maxUnsentMessages', {
        value: 100,
        type: "int"
    });
    this.parameter('noDelay', {
        type : 'boolean',
        value : true
    });
    this.parameter('pfxKeyCertPassword', {
        type : 'string',
        value : ''
    });
    this.parameter('pfxKeyCertPath', {
        type : 'string',
        value : ''
    });
    this.parameter('rawBytes', {
        type : 'boolean',
        value : false
    });
    this.parameter('receiveBufferSize', {
        value: 65536,
        type: "int"
    });
    this.parameter('receiveType', {
        type : 'string',
        value : 'string',
    });
    this.parameter('reconnectAttempts', {
        type : 'int',
        value : 10
    });
    this.parameter('reconnectInterval', {
        type : 'int',
        value : 1000
    });
    this.parameter('reconnectOnClose', {
        type : 'boolean',
        value : true
    });
    this.parameter('sendBufferSize', {
        value: 65536,
        type: "int"
    });
    this.parameter('sendType', {
        type : 'string',
        value : 'string',
    });
    this.parameter('sslTls', {
        type : 'boolean',
        value : false
    });
    this.parameter('trustAll', {
        type : 'boolean',
        value : false
    });
    this.parameter('trustedCACertPath', {
        type : 'string',
        value : ''
    });
    
    // Attempt to add a list of options for types, but do not error out
    // if the socket module is not supported by the host.
    try {
        this.parameter('receiveType', {
            options : socket.supportedReceiveTypes()
        });
        this.parameter('sendType', {
            options : socket.supportedSendTypes()
        });
    } catch(err) {
        this.error(err);
    }
};

/** Handle input on 'toSend' by sending the specified data to the server. */
exports.toSendInputHandler = function () {
    client.send(this.get('toSend'));
};

/** Initiate a connection to the server using the current parameter values,
 *  set up handlers for for establishment of the connection, incoming data,
 *  errors, and closing from the server, and set up a handler for inputs
 *  on the toSend() input port.
 */
exports.initialize = function () {

    client = new socket.SocketClient(getParameter('port'), this.getParameter('host'),
        {
            'connectTimeout' : this.getParameter('connectTimeout'),
            'discardMessagesBeforeOpen' : this.getParameter('discardMessagesBeforeOpen'),
            'idleTimeout' : this.getParameter('idleTimeout'),
            'keepAlive' : this.getParameter('keepAlive'),
            'maxUnsentMessages' : this.getParameter('maxUnsentMessages'),
            'noDelay' : this.getParameter('noDelay'),
            'pfxKeyCertPassword' : this.getParameter('pfxKeyCertPassword'),
            'pfxKeyCertPath' : this.getParameter('pfxKeyCertPath'),
            'rawBytes' : this.getParameter('rawBytes'),
            'receiveBufferSize' : this.getParameter('receiveBufferSize'),
            'receiveType' : this.getParameter('receiveType'),
            'reconnectAttempts' : this.getParameter('reconnectAttempts'),
            'reconnectInterval' : this.getParameter('reconnectInterval'),
            'sendBufferSize' : this.getParameter('sendBufferSize'),
            'sendType' : this.getParameter('sendType'),
            'sslTls' : this.getParameter('sslTls'),
            'trustAll' : this.getParameter('trustAll'),
            'trustedCACertPath' : this.getParameter('trustedCACertPath')
        }
    );
    
    var self = this;

    client.on('open', function() {
        console.log('Status: Connection established');
        self.send('connected', true);
    });
    client.on('data', function(data) {
        self.send('received', data);
    });

    // Bind onClose() to caller's object, so that 'this' is defined
    // in onClose() to be the object on which this initialize() function
    // is called.
    client.on('close', onClose.bind(this));
    client.on('error', function (message) {
        self.error(message);
    });
    this.addInputHandler('toSend', exports.toSendInputHandler.bind(this));
};

/** Send false to 'connected' output, and if 'reconnectOnClose'
 *  parameter evaluates to true and wrapup() has not been called,
 *  then invoke initialize().
 *  This will be called if either side closes the connection.
 *  @param message Possible message about the closure.
 */
function onClose(message) {
    console.log('Status: Connection closed: ' + message);
    if (client) {
        // wrapup() has not been called.
        // Probably the server closed the connection.
        this.send('connected', false);

        // Close and unregister everything.
        client.removeAllListeners('open');
        client.removeAllListeners('message');
        client.removeAllListeners('close');
        client = null;

        // Reconnect if reconnectOnClose is true.
        if (this.getParameter('reconnectOnClose')) {
            // Use 'this' rather than 'export' so initialize() can be overridden.
            this.initialize();
        }
    }
}

/** Return true if this client has an open connection to the server. */
exports.isOpen = function () {
    return client.isOpen();
};

/** Close the web socket connection. */
exports.wrapup = function () {
    if (client) {
        client.removeAllListeners('open');
        client.removeAllListeners('message');
        client.removeAllListeners('close');
        client.close();
        console.log('Status: Connection closed in wrapup.');
        client = null;
    }
};
