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

/** This accessor establishes a server that can accept connection requests for
 *  a TCP socket and can send and/or receives messages from the client that makes the
 *  request.
 *
 *  When the server is listening and accepting connections, a 'true' is emitted on the
 *  `listening` output port.
 *
 *  When a connection is established, this accessor outputs on the `connection` output
 *  an object with the following fields:
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
 *  to send(). The elements of the array will be sent in sequence all
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
 *  @output {int} listening When the server is listening for connections, this port will
 *    produce the port number that the server is listening on
 *    (this is useful if the port is specified to be 0).
 *  @output connection Output an object with the fields specified above when a
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
 *  @parameter {string} keyStorePassword If sslTls is set to true, then this option
 *    needs to specify the password for the key store specified by keyStorePath.
 *  @parameter {string} keyStorePath If sslTls is set to true, then this option
 *    needs to specify the fully qualified filename for the file that stores the
 *    certificate that this server will use to identify itself. This path can be
 *    any of those understood by the Ptolemy host, e.g. paths beginning with $CLASSPATH/.
 *  @parameter {boolean} noDelay If true, data as sent as soon as it is available
 *    (the default). If false, data may be accumulated until a reasonable packet size is
 *    formed in order to make more efficient use of the network (using Nagle's algorithm).
 *  @parameter {int} port The default port to listen on. This defaults to 4000.
 *    a value of 0 means to choose a random ephemeral free port.
 *  @parameter {boolean} rawBytes If true (the default), then transmit only the data bytes provided
 *    to send() without any header. If false, then prepend sent data with length
 *    information and assume receive data starts with length information.
 *    Setting this false on both ends will ensure that each data item passed to
 *    send() is emitted once in its entirety at the receiving end, as a single
 *    message. When this is false, the receiving end can emit a partially received
 *    message or could concatenate two messages and emit them together.
 *  @parameter {int} receiveBufferSize The size of the receive buffer. Defaults to
 *    65536.
 *  @parameter {string} receiveType See below.
 *  @parameter {int} sendBufferSize The size of the receive buffer. Defaults to
 *    65536.
 *  @parameter {string} sendType See below.
 *  @parameter {boolean} sslTls Whether SSL/TLS is enabled. This defaults to false.
 *
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

/* These are needed by JSLint, see https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSLint */
"use strict";
/*global addInputHandler, error, get, getParameter, input, onClose, output, parameter, removeInputHandler, send */

var socket = require('socket');

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function () {
    input('toSend');
    input('toSendID', {
        type: 'int',
        value: 0
    });
    output('listening', {
        type: 'int'
    });
    output('connection');
    output('received');
    output('receivedID');

    // The parameters below are listed alphabetically.
    parameter('clientAuth', {
        type : 'string',
        value : 'none'    // Indicates no SSL/TSL will be used.
    });
    parameter('discardSendToUnopenedSocket', {
        type : 'boolean',
        value : false
    });
    parameter('hostInterface', {
        type : 'string',
        value : '0.0.0.0' // Means listen on all available interfaces.
    });
    parameter('idleTimeout', {
        value: 0,         // In seconds. 0 means don't timeout.
        type: "int"
    });
    parameter('keepAlive', {
        type : 'boolean',
        value : true
    });
    parameter('keyStorePassword', {
        type : 'string',
        value : ''
    });
    parameter('keyStorePath', {
        type : 'string',
        value : ''
    });
    parameter('noDelay', {
        type : 'boolean',
        value : true
    });
    parameter('port', {
        type : 'int',
        value : 4000
    });
    parameter('rawBytes', {
        type : 'boolean',
        value : false      // Means to use a messaging protocol.
    });
    parameter('receiveBufferSize', {
        value: 65536,
        type: "int"
    });
    parameter('receiveType', {
        type : 'string',
        value : 'string',
        options : socket.supportedReceiveTypes()
    });
    parameter('sendBufferSize', {
        value: 65536,
        type: "int"
    });
    parameter('sendType', {
        type : 'string',
        value : 'string',
        options : socket.supportedSendTypes()
    });
    parameter('sslTls', {
        type : 'boolean',
        value : false
    });
};

var server = null;
var connectionCount = 0;
var sockets = [];

/** Handle input on 'toSend' by sending to one or all of the open sockets, depending
 *  on the most recently received value on the `toSendID` input.
 */
exports.toSendInputHandler = function () {
    var dataToSend = get('toSend');
    var idToSendTo = get('toSendID');
    if (idToSendTo === 0) {
        // Broadcast to all sockets.
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i]) {
                sockets[i].send(dataToSend);
            }
        }
    } else if (sockets[idToSendTo]) {
        sockets[idToSendTo].send(dataToSend);
    } else {
        var discardSendToUnopenedSocket = getParameter('discardSendToUnopenedSocket');
        if (discardSendToUnopenedSocket) {
            console.log('Socket with ID ' + idToSendTo
                    + ' is not open. Discarding data: '
                    + dataToSend);
        } else {
            error('Attempting to send data over socket with id ' + idToSendTo
                    + ', but this socket is not open.');
        }
    }
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

    server = new socket.SocketServer(
        {
            'clientAuth' : getParameter('clientAuth'),
            'hostInterface' : getParameter('hostInterface'),
            'idleTimeout' : getParameter('idleTimeout'),
            'keepAlive' : getParameter('keepAlive'),
            'keyStorePassword' : getParameter('keyStorePassword'),
            'keyStorePath' : getParameter('keyStorePath'),
            'noDelay' : getParameter('noDelay'),
            'port' : getParameter('port'),
            'rawBytes' : getParameter('rawBytes'),
            'receiveBufferSize' : getParameter('receiveBufferSize'),
            'receiveType' : getParameter('receiveType'),
            'sendBufferSize' : getParameter('sendBufferSize'),
            'sendType' : getParameter('sendType'),
            'sslTls' : getParameter('sslTls')
        }
    );

	server.on('error', function(message) {
        error(message);
	});
	
	server.on('listening', function(port) {
        console.log('Server: Listening for socket connection requests.');
		send('listening', port);
	});
	
	server.on('connection', function(serverSocket) {
		connectionCount++;
		var socketID = {
		    'id': connectionCount,
		    'remoteHost': serverSocket.remoteHost(),
		    'remotePort': serverSocket.remotePort(),
		    'status': 'open'
		};
		send('connection', socketID);
		
		sockets[connectionCount] = serverSocket;

		serverSocket.on('close', function() {
		    serverSocket.removeAllListeners();
		    socketID.status = 'closed';
            send('connection', socketID);
		    // Avoid a memory leak here.
			sockets[connectionCount] = null;
		});
		serverSocket.on('data', function(data) {
			send('received', data);
			send('receivedID', connectionCount);
		});
		serverSocket.on('error', function(message) {
            error(message);
		});
	});
	
    // Record the object that calls it (could be a derived accessor).
    var callObj = this;
    // Bind the input handler to caller's object so that when it is invoked,
    // it is invoked in the context of that object and not this one.
    addInputHandler('toSend', exports.toSendInputHandler.bind(callObj));
};

/** Close all sockets, unregister event listeners, and close the server.
 */
exports.wrapup = function(){
    for (var i = 0; i < sockets.length; i++) {
        if (sockets[i]) {
            sockets[i].close();
            sockets[i].removeAllListeners();
        }
    }

    sockets = [];

    if (server !== null) {
        server.removeAllListeners();
        server.close();
        server = null;
    }
};
