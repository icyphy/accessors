// Copyright (c) 2016-2017 The Regents of the University of California.
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
//

/**
 * Module supporting TCP sockets. FIXME: NOT ALL MODULE FUNCTIONALITY HAS BEEN IMPLEMENTED.
 * @module socket
 * @author Matt Weber
 * @version $$Id: socket.js 76043 2017-05-06 17:44:23Z eal $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals actor, console, exports, Java, require, util */
/*jslint nomen: true */
/*jshint globalstrict: true */
"use strict";

//Uses the cordova-plugin-chrome-apps-sockets-tcp plugin.
//https://www.npmjs.com/package/cordova-plugin-chrome-apps-sockets-tcp
console.log("WARNING: socket.js module is incomplete.");

if(typeof chrome.sockets == "undefined"){
    console.log("WARNING: socket.js module does not have cordova-plugin-chrome-apps-sockets-tcp installed and will not work correctly.");
}
var tcpPlugin = chrome.sockets.tcp; 


var EventEmitter = require('events').EventEmitter;
var util = require('util');


///////////////////////////////////////////////////////////////////////////////
//// defaultClientOptions

/** FIXME Below are cordova-plugin-chrome-apps-sockets-tcp options. All of them 
 * are optional. Default values are shown here.
 * var defaultClientOptions = {
    'persistent' : false,
    'name' : '', //an application-defined string associated with the socket
    'bufferSize' : 4096 //the size of the buffer used to receive data
 } 
 
 */

/** FIXME: Below are cape code options that are not applicable here.
 * The default options for socket connections from the client side.
 */

/* var defaultClientOptions = {
    'connectTimeout': 6000, // in milliseconds.
    'idleTimeout': 0, // In seconds. 0 means don't timeout.
    'discardMessagesBeforeOpen': false,
    'emitBatchDataAsAvailable': false,
    'keepAlive': true,
    'maxUnsentMessages': 100,
    'noDelay': true,
    'pfxKeyCertPassword': '',
    'pfxKeyCertPath': '',
    'rawBytes': true,
    'receiveBufferSize': 65536,
    'receiveType': 'string',
    'reconnectAttempts': 10,
    'reconnectInterval': 1000,
    'sendBufferSize': 65536,
    'sendType': 'string',
    'sslTls': false,
    'trustAll': false,
    'trustedCACertPath': ''
};
*/

/** Construct an instance of a socket client that can send or receive messages
 *  to a server at the specified host and port.
 *  The returned object subclasses EventEmitter and emits the following events:
 *
 *  * open: Emitted with no arguments when the socket has been successfully opened.
 *  * data: Emitted with the data as an argument when data arrives on the socket.
 *  * close: Emitted with no arguments when the socket is closed.
 *  * error: Emitted with an error message when an error occurs.
 *
 *  You can invoke the this.send() function of this SocketClient object
 *  to send data to the server. If the socket is not opened yet,
 *  then data will be discarded or queued to be sent later,
 *  depending on the value of the discardMessagesBeforeOpen option
 *  (which defaults to false).
 *  
 *  FIXME: No options (including discardMessagesBeforeOpen) 
 *  have been implemented for this Cordova module!!!
 *
 *  The event 'close' will be emitted when the socket is closed, and 'error' if an
 *  an error occurs (with an error message as an argument).
 *
 *  A simple example that sends a message, and closes the socket on receiving a reply.
 *
 *      var socket = require('socket');
 *      var client = new socket.SocketClient();
 *      client.on('open', function() {
 *          client.send('hello world');
 *      });
 *      client.on('data', function onData(data) {
 *          print('Received from socket: ' + data);
 *          client.close();
 *      });
 *      socket.open();
 *
 *  @param port The remote port to connect to.
 *  @param host The remote host to connect to.
 *  @param options The options.
 */

exports.SocketClient = function(port, host, options) {
    console.log('socket.js: SocketClient(' + port + ', ' + host + ', options');
    console.log('Warning: Cordova socket options have not yet been implemented in socket.js!');
    var socketId;

    // Set default values of arguments.
    // Careful: port == 0 means to find an available port, I think.
    this.port = port;
    if (port === null) {
        this.port = 4000;
    }
    this.host = host || 'localhost';


    //FIXME: Reconcile tcpPlugin's options with capeCode's options.
    //All of cordova-plugin-chrome-apps-sockets-tcp's options are optional, so it's ok to omit them.
    this.options = {};

    // Fill in default values.
    //this.options = options || {};
    //this.options = util._extend(defaultClientOptions, this.options);

    //FIXME: support pending sends
    //this.pendingSends = []
};
util.inherits(exports.SocketClient, EventEmitter);

/** Open the client. Call this after setting up listeners. */
exports.SocketClient.prototype.open = function () {
    console.log('socket.js: SocketClient.open(): ' + this.port + ", " + this.host);
    var thiz = this;
    tcpPlugin.create( function(createInfo){
        thiz.socketId = createInfo.socketId;
        tcpPlugin.connect(thiz.socketId, thiz.host, thiz.port, function(connectResult){
            if(connectResult < 0){
                console.log("Error connecting in socket.js. Error Code: " + connectResult);
                thiz.emit('error', "Error connecting in socket.js. Error Code: " + connectResult);
            }
            tcpPlugin.onReceive.addListener(function(info){
                var message;
                if(thiz.socketId == info.socketId){
                    message = arrayBufferToU8String(info.data);
                    thiz.emit('data', message);
                }
            });
            tcpPlugin.onReceiveError.addListener(function(info){
                var message;
                if(thiz.socketId == info.socketId){
                    thiz.emit('error', "Network error occured while waiting for data on socket: " + thiz.socketID + ", to " + thiz.host +" " + thiz.port + ". Error code: " + info.resultCode);
                }
            });

            thiz.emit('open');


        });
    });
};


/** cordova-plugin-chrome-apps-sockets-tcp uses an array buffer for sent and received messages.
 *  This helper function interprets the buffer as a UTF-8 string
 * 
 */

function arrayBufferToU8String(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

/** cordova-plugin-chrome-apps-sockets-tcp uses an array buffer for sent and received messages.
 *  This helper function creates a buffer for a UTF-8 string. 
 * 
 */

function stringToArrayBuffer(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);

  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


/** Send data over the socket.
 *  If the socket has not yet been successfully opened, then queue
 *  data to be sent later, when the socket is opened, unless
 *  discardMessagesBeforeOpen is true.
 *
 *  FIXME: discardMessageBeforeOpen is an option which has NOT been implemented yet.
 *  current behavior is as if it's set to true.
 *  @param data The data to send.
 */

exports.SocketClient.prototype.send = function (data) {
    //console.log('socket.js: SocketClient.send(' + data + ')');
    var thiz = this;
    tcpPlugin.send(this.socketId, stringToArrayBuffer(data), function(sendInfo){
        if(sendInfo.resultCode < 0){
            console.log("Error in sending. Error Code: " + sendInfo.resultCode);
            thiz.emit('error', "Error in sending. Error Code: " + sendInfo.resultCode);
            thiz.close(); //FIXME: is this right?
        }
        console.log("Send complete");
        if(sendInfo.resultCode == 0){
            console.log("Sent " + sendInfo.bytesSent + " bytes.");
        }
    });
};


/** Close the current connection with the server.
 *  This will indicate to the server that no more data
 *  will be sent, but data may still be received from the server.
 */
exports.SocketClient.prototype.close = function () {
    console.log('socket.js: SocketClient.close()');
    var thiz = this;
    tcpPlugin.close(this.socketId, function(){
        thiz.emit('close');
    });
};


