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
 *
 *  If connection is not established immediately, the accessor will attempt to
 *  reconnect (numberOfRetries) times at an interval of (reconnectInterval)
 *
 *  Whenever an input is received on the `'toSend'`
 *  input, the message is sent to the socket.
 *
 *  Whenever a message is received from the socket, that message is
 *  produced on the `'received'` output.
 *
 *  When `wrapup()` is invoked, this accessor closes the
 *  connection.
 *  
 *  If the connection is dropped midway, the client will attempt to reconnect if 
 *  (reconnectOnClose) is true. This does not apply when the accessor wraps up. 
 *
 *  The data can be any type that has a JSON representation.
 *  For incoming messages, this accessor assumes that the message is
 *  a string in UTF-8 that encodes a JSON object.<br/>
 *
 *  This accessor can be extended by other accessors that need web socket functionality. 
 *  See `RosPublisher.js` for an example.
 *
 *  This accessor requires the 'webSocket' module.
 *
 *  @accessor WebSocketClient
 *  @parameter {string} server The IP address or domain name of server. Defaults to 'localhost'.
 *  @parameter {int} port The port that the web socket listens to. Defaults to 8080.
 *  @parameter {int} numberOfRetries The number of times to retry if a connection fails. Defaults to 5.
 *  @parameter {int} timeBetweenRetries The time between retries in milliseconds. Defaults to 100.
 *  @parameter {boolean} reconnectOnClose The option of whether or not to reconnect when disconnected. 
 *  @input {JSON} toSend The data to be sent over the socket.
 *  @output {boolean} connected Output `true` on connected and `false` on disconnected.
 *  @output {JSON} received The data received from the web socket server.
 *  @author Hokeun Kim, Marcus Pan, Edward A. Lee
 *  @version $Id$
 */

var WebSocket = require('webSocket');
var client = null;
var inputHandle = null;

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function() {
  parameter('server', {
    type: 'string',
    value: 'localhost'
  });
  parameter('port', {
    type: 'int',
    value: 8080
  });
  parameter('numberOfRetries', {
    type: 'int',
    value: 5
  });
  parameter('timeBetweenRetries', {
    type: 'int',
    value: 100
  });
  parameter('reconnectOnClose', {
    type: 'boolean',
    value: true
  });
  input('toSend', {
    type: 'JSON'
  });
  output('connected', {
    type: 'boolean'
  });
  output('received');
}

/** Initializes accessor by attaching functions to inputs. */
exports.initialize = function() {
 
  //record the object that calls it (could be a derived accessor). 
  var callObj = this;
   
  client = new WebSocket.Client({
    'host':getParameter('server'),
    'port':getParameter('port'),
    'numberOfRetries':getParameter('numberOfRetries'),
    'timeBetweenRetries':getParameter('timeBetweenRetries')
  });
  
  client.on('open', onOpen);
  
  client.on('message', onMessage);

  //bind onClose() to caller's object, 
  //so initialize() of caller's object is called if reconnect is true.
  client.on('close', onClose.bind(callObj));
  client.on('error', function(message) {
    error(message)
  });
  //only execute once, and not when trying to reconnect. 
  if (inputHandle == null) { 
      inputHandle = addInputHandler('toSend', this.toSendInputHandler);
  }
} 

/** Handles input on 'toSend'. */
exports.toSendInputHandler = function() {
  exports.sendToWebSocket(get('toSend'));
}

/** Sends JSON data to the web socket. */
exports.sendToWebSocket = function(data) {
  client.send(data);
  console.log("Sending to web socket: " + JSON.stringify(data));
}

/** Executes once  web socket establishes a connection.
 *   Sets 'connected' output to true.
 */
function onOpen() {
   console.log('Status: Connection established');
   send('connected', true);
}
  
/** Executes once web socket closes.<br>
 *  Sets 'connected' output to false.<br>
 *  If reconnect parameter is true, call initialize() of caller's object 
 *  (this could be a derived accessor).
 */
function onClose(message) {
   send('connected', false);
   console.log('Status: Connection closed: ' + message);
   if (getParameter('reconnectOnClose')) {
      this.initialize();
   }
}
  
/** Outputs message received from web socket. */
function onMessage(message) {
   send('received', message);
}
  
/** Closes web socket connection. */
exports.wrapup = function() {
   if (inputHandle != null) {
      removeInputHandler(inputHandle, 'toSend');
   }
   //'error' event may be triggered on wrapup, so don't remove listener
   if (client) {
      client.removeAllListeners('open');
      client.removeAllListeners('message');
      client.removeAllListeners('close');
      console.log('closing listeners');
      client.close();
   }
}

