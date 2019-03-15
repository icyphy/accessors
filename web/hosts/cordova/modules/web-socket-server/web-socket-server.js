// web-socket-server module for cordova accessors host.
// 
// Below is the copyright agreement for the Ptolemy II system.
//
// Copyright (c) 2018-2019 The Regents of the University of California.
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

/**
 *  Module for running a local web socket server. This server does not run as a service
 *  This is not a background service. When the cordova view is destroyed/terminated, the server is stopped.
 *  This module is based on the cordova-plugin-websocket-server plugin
 *  at https://github.com/becvert/cordova-plugin-websocket-server. This is a minimalistic plugin
 *  so read the warnings below.
 *
 *  WARNING: The plugin used for this module does not support any other network
 *  interface than 0.0.0.0 (binds to all network interfaces). But since it is sometimes desirable
 *  to block all connections that don't originate from localhost, I manually implemented the following
 *  policy on top of the plugin: If host interface is given as '127.0.0.1' or 'localhost' (the default)
 *  or '::1' (the ipv6 loopback address) any connections opened from a remote address which is not one of those addresses will be
 *  immediately closed. 
 *
 *  WARNING: The plugin used for this module doesn't support any specified MIME type.
 *  This module provides 'application/json' parsing on incoming messages. 
 *
 *  @module web-socket-server
 *  @author Matt Weber
 *  @version $$Id: web-socket-server.js 75980 2017-07-18 00:19:25Z chadlia.jerad $$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, console, get, getParameter, getResource, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/

'use strict';
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var debug = false;

exports.requiredPlugins = ['cordova-plugin-websocket-server'];

if(typeof cordova.plugins.wsserver == "undefined"){
    console.log("WARNING: web-socket-server.js module does not have cordova-plugin-websocket-server installed and will not work correctly.");
}

//Cordova plugin: https://github.com/becvert/cordova-plugin-websocket-server
var wsserver = cordova.plugins.wsserver;

//An example connection:
/* conn: {
 'uuid' : '8e176b14-a1af-70a7-3e3d-8b341977a16e',
 'remoteAddr' : '192.168.1.10',
 'httpFields' : {...},
 'resource' : '/?param1=value1&param2=value2'
 } */

//Open sockets are inserted into this associative array, keyed as (conn.uuid, socket)
var activeSockets = {};

///////////////////////////////////////////////////////////////////////////////
//// supportedReceiveTypes

/** Return an array of the types supported by the current host for
 *  receiveType arguments.
 */
exports.supportedReceiveTypes = function () {
    // WARNING The cordova plugin does not make it possible to specify a MIME type.
    // I have verified you can send and receive text. 
    return ['application/json', 'text/plain'];
};

///////////////////////////////////////////////////////////////////////////////
//// supportedSendTypes

/** Return an array of the types supported by the current host for
 *  sendType arguments.
 */
exports.supportedSendTypes = function () {
    // WARNING The cordova plugin does not make it possible to specify a MIME type.
    // I have verified you can send and receive text.  
    return ['application/json', 'text/plain'];
};

///////////////////////////////////////////////////////////////////////////////
//// Server

/** Construct an instance of WebSocket Server.
 *  After invoking this constructor (using new), the user script should set up listeners
 *  and then invoke the start() function on this Server.
 *  This will create an HTTP server on the local host.
 *  The options argument is a JSON object containing the following optional fields:
 *  * hostInterface: WARNING: The host interface cannot be set with this cordova plugin.
 *    This parameter is ignored and is automatically set to 0.0.0.0 (all interfaces)
 *  * port: The port on which to listen for connections (the default is 80,
 *    which is the default HTTP port). Setting port 0 means any free port.
 *  * receiveType: The MIME type for incoming messages, which defaults to application/json'.
 *    See the Client documentation for supported types.
 *  * sendType: The MIME type for outgoing messages, which defaults to 'application/json'.
 *    See the Client documentation for supported types.
 * 
 *  This subclasses EventEmitter, emitting events 'listening' and 'connection'.
 *  A typical usage pattern looks like this:
 * 
 *  <pre>
 *     var webSocket = require('webSocketServer');
 *     var server = new webSocket.Server({'port':8082});
 *     server.on('listening', onListening);
 *     server.on('connection', onConnection);
 *     server.start();
 *  </pre>
 * 
 *  where onListening is a handler for an event that this Server emits
 *  when it is listening for connections, and onConnection is a handler
 *  for an event that this Server emits when a client requests a websocket
 *  connection and the socket has been successfully established.
 *  When the 'connection' event is emitted, it will be passed a Socket object,
 *  and the onConnection handler can register a listener for 'message' events
 *  on that Socket object, as follows:
 * 
 *  <pre>
 *    server.on('connection', function(socket) {
 *        socket.on('message', function(message) {
 *            console.log(message);
 *            socket.send('Reply message');
 *        });
 *     });
 *  </pre>
 * 
 *  The Socket object also has a close() function that allows the server to close
 *  the connection.
 * 
 *  FIXME: Should provide a mechanism to validate the "Origin" header during the
 *    connection establishment process on the serverside (against the expected origins)
 *    to avoid Cross-Site WebSocket Hijacking attacks.
 *
 *  @param options The options.
 */
exports.Server = function (options) {
    if (typeof options.port === 'undefined' || options.port === null) {
        this.port = 80;
    } else {
        this.port = options.port;
    }
    this.hostInterface = options.hostInterface || 'localhost';
    this.sslTls = options.sslTls || false;
    this.pfxKeyCertPassword = options.pfxKeyCertPassword || '';
    this.pfxKeyCertPath = options.pfxKeyCertPath || '';
    this.receiveType = options.receiveType || 'application/json';
    this.sendType = options.sendType || 'application/json';
    this._serverInstance = this;
};
util.inherits(exports.Server, EventEmitter);


/** Start the server. */
exports.Server.prototype.start = function () {

    var self = this;

    wsserver.start(this.port, {
        // WebSocket Server handlers
        'onFailure' :  function(addr, port, reason) {
            console.log('Error in web-socket-server. Failed to start server on addr: '
                + addr + ', port: ' + port + ", reason: " + reason);
        },
        // WebSocket Connection handlers
        'onOpen' : function(conn) {
            //Check to see if a socket already exists for this connection.
            //This is a new connection, so create a new socket.

            if (debug) {
                console.log('A user connected from ' + conn.remoteAddr);
            }

            //If hostInterface a synonym of 'localhost', reject all connections
            //that don't originate from a synonym of 'localhost'
            if(self.hostInterface == 'localhost' || self.hostInterface == '127.0.0.1' || self.hostInterface == '::1'){
                //In ipv4, any packet sent to any of those addresses (127.0.0.1 through 127.255.255.255) is looped back
                //See https://en.wikipedia.org/wiki/Localhost#Name_resolution
                if(! (conn.remoteAddr.startsWith("127.") || conn.remoteAddr == 'localhost' || conn.remoteAddr == '::1')){
                    
                    //Code 1008 is a policy violation. See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
                    var code = 1008;
                    var reason = "Invalid address"
                    wsserver.close(conn, code, reason);
                    if (debug) {
                        console.log('Connection from non-localhost has been immediately closed.');
                    }
                    return;
                }
            }

            var socket = new exports.Socket(self._serverInstance, conn, self._serverInstance.receiveType, self._serverInstance.sendType);
            activeSockets[conn.uuid] = socket;
            self._serverInstance.emit('connection', socket);
        },
        'onMessage' : function(conn, msg) {

            if (debug) {
                console.log('Received message from: ' + conn.remoteAddr);
            }
            var socket = activeSockets[conn.uuid];
            socket._notifyIncoming(msg);
            //Call notifyIncoming on the message's socket.
        },
        'onClose' : function(conn, code, reason, wasClean) {
            if(debug){
                console.log('A user disconnected from ' + conn.remoteAddr + " with code: "
                    + code + ", reason: " + reason + ", and wasClean: " + wasClean);
            }
            //No need to call close on the socket because it is already closed.
            var connUUID = conn.uuid;
            delete activeSockets.connUUID;
        },
        // Other options
        // 'origins' : [ 'file://' ], // validates the 'Origin' HTTP Header.
        // 'protocols' : [ 'my-protocol-v1', 'my-protocol-v2' ], // validates the 'Sec-WebSocket-Protocol' HTTP Header.
        // 'tcpNoDelay' : true // disables Nagle's algorithm.
    }, function onStart(addr, port) {
        if(debug){
            console.log('web-socket-server module listening on ' + addr + ' and port:' + port);            
        }
        self.emit('listening', port);
        // if(debug || self.port == 0){
        //     console.log('web-socket-server module listening on ' + addr + ' and port:' + port);            
        // }
    }, function onDidNotStart(reason) {
        console.log('web-socket-server module did not start. Reason: ' + reason);
    });
};

exports.Server.prototype.stop = function () {
    wsserver.stop(function onStop(addr, port) {
        if(debug){
            console.log('Stopped listening on addr: ' + addr + 'and port: ' + port);
        }
    });
};


//NOTE: A socket helper in Cordova is the connection object.
/** Construct (using new) a Socket object for the server side of a new connection.
 *  This is called by the socketCreated function above whenever a new connection is
 *  established at the request of a client. It should not normally be called by
 *  the JavaScript programmer. The returned Socket is an event emitter that emits
 *  'message' events.
 *  @param serverWebSocket The Java ServerWebSocket object. NOTE: In this host, the object is the global
 *         server object.
 *  @param helper NOTE: A socket helper in Cordova is the connection object.
 *  @param receiveType The MIME type for incoming messages, which defaults to 'application/json'.
 *  @param sendType The MIME type for outgoing messages, which defaults to 'application/json'.
 */
exports.Socket = function (serverWebSocket, helper, receiveType, sendType) {
    //Helper is the conn object in this module.
    this.helper = helper; 
    this.serverWebSocket = serverWebSocket;
    //serverWebSocket is ignored here because The Cordova plugin can only start one webSocketServer,
    //and there's no point associating that (global) server instance with the connection.
    this.receiveType = receiveType;
    this.sendType = sendType;
};
util.inherits(exports.Socket, EventEmitter);

/** Close the socket. Normally, this would be called on the client side,
 *  not on the server side. But the server can also close the connection.
 */
exports.Socket.prototype.close = function () {
    //Note, according to https://github.com/becvert/cordova-plugin-websocket-server#closeconn-code-reason
    //this function could be called close(conn, code, reason), but close event code and reason are optional.
    var connUUID = this.helper.uuid;
    delete activeSockets.connUIID;
    wsserver.close(this.helper);
    if(debug){
        console.log("Closing connection: " + connUUID);
    }
};

/** Return true if the socket is open.
 */
exports.Socket.prototype.isOpen = function () {
    var connUUID = this.helper.uuid;
    if(activeSockets.hasOwnProperty(connUUID)){
        return true;
    } else {
        return false;
    }
};

/** Notify this object of a received message from the socket.
 *  This function attempts to parse the message as JSON and then
 *  emits a "message" event with the message as an argument.
 *  This function is called by the helper and should not be called
 *  by the user of this module.
 *  @param message The incoming message.
 */
exports.Socket.prototype._notifyIncoming = function (message) {
    if (this.receiveType == 'application/json') {
        try {
            message = JSON.parse(message);
        } catch (error) {
            this.emit('error', error);
            return;
        }
    }
    // Assume the helper has already provided the correct type.
    this.emit("message", message);
};

/** Send data over the web socket.
 *  The data can be anything that has a JSON representation.
 *  @param data The data to send.
 */
exports.Socket.prototype.send = function (data) {
    if (this.sendType == 'application/json') {
        wsserver.send(this.helper, JSON.stringify(data));
    } else if (this.sendType.search(/text\//) === 0) {
        wsserver.send(this.helper, data.toString());
    } else {
        wsserver.send(this.helper, data);
    }
};