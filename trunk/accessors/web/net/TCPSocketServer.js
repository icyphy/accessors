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

/** This accessor establishes a server that can accept connection requests for
 *  a TCP socket and can send and/or receives messages from the client that makes the
 *  request.
 *
 *  When the server is listening and accepting connections, the port on which it is
 *  listening is emitted on the `listening` output port.
 *
 *  When a connection is established, this accessor outputs on the `connection` output
 *  an object with the following properties:
 *
 *  * **id**: A unique ID identifying the connection (a positive integer).
 *  * **remoteHost**: The IP address of the remote host for the socket (a string).
 *  * **remotePort**: The port of the remote host for the socket (an integer).
 *  * **status**: The string 'open'.
 *
 *
 *  When the connection is closed, the same object as above is produced on the
 *  `connection` output, except with status being 'closed'.
 *
 *  When data is received from the connection, two outputs are produced.
 *  The data itself is produced on the `received` output.  The ID of the connection
 *  over which the data arrived is produced on the `receivedID` output.
 *
 *  To send data over a connection, provide the data on the `toSend` input port
 *  and the ID of the connection on the `toSendID` input port.  To send to all open
 *  connections, provide an ID of 0 (zero).
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
 *  If the `rawBytes` option is set to false, then each data item that arrives on
 *  `toSend`, of any type or array of types, will be coalesced into a single message and
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
 *  The client might similarly lose messages by the same two mechanisms occurring
 *  on the client side. In that case, messages will presumably be displayed on the
 *  client side.
 *
 *  Accessors that extend this one can override the `toSendInputHandler` function
 *  to customize what is sent.
 *
 *  This accessor requires the 'socket' module.
 *
 *  @accessor net/TCPSocketServer
 *
 *  @input toSend The data to be sent over the socket.
 *  @input toSendID The ID of the connection over which to send the data, where 0 means
 *    to send to all open connections.
 *  @output {int} listening When the server is listening for connections, this output
 *    will produce the port number that the server is listening on
 *    (this is useful if the port is specified to be 0).
 *  @output connection Output an object with the properties specified above when a
 *     connection is established.
 *  @output received The data received from the web socket server.
 *  @output receivedID The ID of the connection over which data produced on the received
 *    output was received. This is a positive integer, as indicated in the connection
 *    output.
 *
 *  @parameter {string} clientAuth One of 'none', 'request', or 'required', meaning
 *    whether it requires that a certificate be presented.
 *  @parameter {boolean} discardSendToUnopenedSocket If true, then discard any data
 *   sent to a socket that is not open. The data will be logged using console.log()
 *   instead. This defaults to false.
 *  @parameter {string} hostInterface The name of the network interface to use for
 *    listening, e.g. 'localhost'. The default is '0.0.0.0', which means to
 *    listen on all available interfaces.
 *  @parameter {int} idleTimeout The amount of idle time in seconds that will cause
 *    a disconnection of a socket. This defaults to 0, which means no
 *    timeout.
 *  @parameter {boolean} keepAlive Whether to keep a connection alive and reuse it. This
 *    defaults to true.
 *  @parameter {boolean} noDelay If true, data as sent as soon as it is available
 *    (the default). If false, data may be accumulated until a reasonable packet size is
 *    formed in order to make more efficient use of the network (using Nagle's algorithm).
 *  @parameter {string} pfxKeyCertPassword If sslTls is set to true, then this option
 *    needs to specify the password for the pfx key-cert file specified by pfxKeyCertPath.
 *  @parameter {string} pfxKeyCertPath If sslTls is set to true, then this option
 *    needs to specify the fully qualified filename for the file that stores the
 *    private key and certificate that this server will use to identify itself. This path can be
 *    any of those understood by the Ptolemy host, e.g. paths beginning with $CLASSPATH/.
 *  @parameter {int} port The default port to listen on. This defaults to 4000.
 *    a value of 0 means to choose a random ephemeral free port.
 *  @parameter {boolean} rawBytes If true (the default), then transmit only the data bytes provided
 *    to this.send() without any header. If false, then prepend sent data with length
 *    information and assume receive data starts with length information.
 *    Setting this false on both ends will ensure that each data item passed to
 *    this.send() is emitted once in its entirety at the receiving end, as a single
 *    message. When this is false, the receiving end can emit a partially received
 *    message or could concatenate two messages and emit them together.
 *  @parameter {int} receiveBufferSize The size of the receive buffer. Defaults to
 *    65536.
 *  @parameter {string} receiveType See below.
 *  @parameter {int} sendBufferSize The size of the receive buffer. Defaults to
 *    65536.
 *  @parameter {string} sendType See below.
 *  @parameter {boolean} sslTls Whether SSL/TLS is enabled. This defaults to false.
 *  @parameter {string} trustedCACertPath If sslTls is set to true and this server
 *    requests/requires a certificate from the client, then this option needs to specify
 *    the filename for the file that stores the certificate of a certificate authority (CA) that
 *    this server will use to verify client certificates. This path can be any of those
 *    understood by the Ptolemy host, e.g. paths beginning with $CLASSPATH/.
 *    FIXME: Need to be a list of paths for certificates rather than a single path.
 *
 *  @author Edward A. Lee, Hokeun Kim
 *  @version $$Id$$
 */

/* These are needed by JSLint, see https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSLint */
// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global addInputHandler, console, error, exports, get, getParameter, input, onClose, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true */
"use strict";

var socket = require('@accessors-modules/socket');

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function () {
    // console.log('TCPSocketServer.js: setup() start.');
    this.input('toSend');
    this.input('toSendID', {
        type: 'int',
        value: 0
    });
    this.output('listening', {
        type: 'int'
    });
    this.output('connection', {spontaneous: true});
    this.output('received', {spontaneous: true});
    this.output('receivedID', {spontaneous: true});

    // The parameters below are listed alphabetically.
    this.parameter('clientAuth', {
        type: 'string',
        value: 'none' // Indicates no SSL/TSL will be used.
    });
    this.parameter('discardSendToUnopenedSocket', {
        type: 'boolean',
        value: false
    });
    this.parameter('hostInterface', {
        type: 'string',
        value: '0.0.0.0' // Means listen on all available interfaces.
    });
    this.parameter('idleTimeout', {
        value: 0, // In seconds. 0 means don't timeout.
        type: "int"
    });
    this.parameter('keepAlive', {
        type: 'boolean',
        value: true
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
    this.parameter('port', {
        type: 'int',
        value: 4000
    });
    this.parameter('rawBytes', {
        type: 'boolean',
        value: false // Means to use a messaging protocol.
    });
    this.parameter('receiveBufferSize', {
        value: 65536,
        type: "int"
    });
    this.parameter('receiveType', {
        type: 'string',
        value: 'string'
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
        error(err);
    }
    // console.log('TCPSocketServer.js: setup() end.');
};

var server = null;
var connectionCount = 0;
var sockets = [];

/** Handle input on 'toSend' by sending to one or all of the open sockets, depending
 *  on the most recently received value on the `toSendID` input.
 */
exports.toSendInputHandler = function () {
    // console.log('TCPSocketServer.js: toSendInputHandler() start.');
    var dataToSend = this.get('toSend');
    var idToSendTo = this.get('toSendID');
    if (idToSendTo === 0) {
        // Broadcast to all sockets.
        for (var i = 0; i < sockets.length; i++) {
            // console.log('TCPSocketServer.js: toSendInputHandler() socket[' + i + '].');
            if (sockets[i]) {
                // console.log('TCPSocketServer.js: toSendInputHandler() socket[' + i + ']. sending: ' + dataToSend);
                sockets[i].send(dataToSend);
                // console.log('TCPSocketServer.js: toSendInputHandler() socket[' + i + ']. done sending: ' + dataToSend);
            }
        }
    } else if (sockets[idToSendTo]) {
        // console.log('TCPSocketServer.js: toSendInputHandler() socket[idToSendTo]: ' + dataToSend);
        sockets[idToSendTo].send(dataToSend);
        // console.log('TCPSocketServer.js: toSendInputHandler() socket[idToSendTo]: ' + dataToSend + ' done.');
    } else {
        var discardSendToUnopenedSocket = this.getParameter('discardSendToUnopenedSocket');
        if (discardSendToUnopenedSocket) {
            console.log('Socket with ID ' + idToSendTo +
                ' is not open. Discarding data.');
        } else {
            error('Attempting to send data over socket with id ' + idToSendTo +
                ', but this socket is not open.');
        }
    }
    // console.log('TCPSocketServer.js: toSendInputHandler() end.');
};

/** Initialize the accessor by starting the server with the current parameter values
 *  specifying the options, setting up listeners to be notified when the server is
 *  is listening for connections, when a client requests and connection,
 *  and when errors occur, and setting up an input handler
 *  for data arriving on the toSend input. When a client requests a connection, the
 *  handler will open the socket, send a `connection` output, and and set up listeners
 *  for incoming data, errors, and closing of the socket from the remote site.
 */
exports.initialize = function () {
    // console.log('TCPSocketServer.js: initialize() start: port: ' + this.getParameter('port'));

    server = new socket.SocketServer({
        'clientAuth': this.getParameter('clientAuth'),
        'hostInterface': this.getParameter('hostInterface'),
        'idleTimeout': this.getParameter('idleTimeout'),
        'keepAlive': this.getParameter('keepAlive'),
        'noDelay': this.getParameter('noDelay'),
        'pfxKeyCertPassword': this.getParameter('pfxKeyCertPassword'),
        'pfxKeyCertPath': this.getParameter('pfxKeyCertPath'),
        'port': this.getParameter('port'),
        'rawBytes': this.getParameter('rawBytes'),
        'receiveBufferSize': this.getParameter('receiveBufferSize'),
        'receiveType': this.getParameter('receiveType'),
        'sendBufferSize': this.getParameter('sendBufferSize'),
        'sendType': this.getParameter('sendType'),
        'sslTls': this.getParameter('sslTls'),
        'trustedCACertPath': this.getParameter('trustedCACertPath')
    });

    var self = this;

    server.on('error', function (message) {
        self.error(message);
    });

    server.on('listening', function (port) {
        // console.log('TCPSocketServer.js: Listening for socket connection requests on port ' + port);
        self.send('listening', port);
    });

    server.on('connection', function (serverSocket) {
        // console.log('TCPSocketServer.js: server connection listener: localPort: ' + serverSocket.localPort + ', remotePort: ' + serverSocket.remotePort());
        // serverSocket is an instance of the Socket class defined
        // in the socket module.
        connectionCount++;
        var socketInstance = connectionCount;
        var socketID = {
            'id': socketInstance,
            'remoteHost': serverSocket.remoteHost(),
            'remotePort': serverSocket.remotePort(),
            'status': 'open'
        };
        self.send('connection', socketID);

        sockets[socketInstance] = serverSocket;

        serverSocket.on('close', function () {
            // console.log('TCPSocketServer.js: serverSocket close listener');
            socketID.status = 'closed';
            self.send('connection', socketID);
            // Avoid a memory leak here.
            sockets[socketInstance] = null;
        });
        serverSocket.on('data', function (data) {
            // console.log('TCPSocketServer.js: serverSocket data listener: ' + data);
            var util = require('util');
            // console.log(util.inspect(data));
            self.send('received', data);
            self.send('receivedID', socketInstance);
        });
        serverSocket.on('error', function (message) {
            // console.log('TCPSocketServer.js: serverSocket error listener: ' + message);
            self.error(message);
        });
    });

    // Open the server after setting up all the handlers.
    server.start();

    // Bind the input handler to caller's object so that when it is invoked,
    // it is invoked in the context of that object and not this one.
    this.addInputHandler('toSend', exports.toSendInputHandler.bind(this));
    // console.log('TCPSocketServer.js: initialize() end');
};

/** Close all sockets, unregister event listeners, and stop the server.
 */
exports.wrapup = function () {
    // console.log('TCPSocketServer.js: wrapup()');
    sockets = [];

    if (server !== null) {
        server.stop();
        server = null;
    }
};
