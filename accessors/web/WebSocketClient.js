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
 *  `'ready'` is set to `true`. If a connection
 *  was not established during `initiazlize()`, this
 *  accessor will not try to connect again.
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
 *  The data can be any type that has a JSON representation.
 *  For incomming messages, this accessor assumes that the message is
 *  a string in UTF-8 that encodes a JSON object.<br/>
 *  A copy of this accessor is also in the modules directory, which other accessors can use as 
 *  a generic implementation of a web socket. This accessor-module exports a sendToWebSocket(data) function 
 *  which other accessors can use, for example:
 *  <pre>var wsClient = require('webSocketClient');
 *       wsClient.sendToWebSocket(JSONDataToSend);
 *  </pre> 
 *
 *  This accessor-module also exports its inputHandler function on
 *  'toSend' which other accessors can override, for example:n
 *  <pre> var wsClient = require('webSocketClient');
 *       wsClient.toSendInputHandler = function() {...}
 *  </pre>
 *  See `RosPublisher.js` for an example.
 *  This accessor requires the 'webSocket' module.
 *
 *  @accessor WebSocketClient
 *  @parameter {string} server The IP address or domain name of server. Defaults to 'localhost'.
 *  @parameter {int} port The port that the web socket listens to. Defaults to 8080.
 *  @parameter {int} numberOfRetries The number of times to retry if a connection fails. Defaults to 5.
 *  @parameter {int} timeBetweenRetries The time between retries in milliseconds. Defaults to 100.
 *  @parameter {boolean} reconnect The option of whether or not to reconnect when disconnected. 
 *  @parameter {int} reconnectIntervalMilliSeconds The millisecond delay before reconnecting if reconnect is true. 
 *  @input {JSON} toSend The data to be sent over the socket.
 *  @output {boolean} connected Output `true` on connected and `false` on disconnected.
 *  @output {JSON} received The data received from the web socket server.
 *  @author Hokeun Kim, Marcus Pan, Edward A. Lee
 *  @version $Id$
 */

var WebSocket = require('webSocket');
var client = null;
var inputHandle = null;
var initHandle = null;

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function() {
  accessor.parameter('server', {
    type: 'string',
    value: 'localhost',
  });
  accessor.parameter('port', {
    type: 'int',
    value: 8080,
  });
<<<<<<< .mine
  accessor.parameter('numberOfRetries', {
    type: 'int',
    value: 5,
  });
  accessor.parameter('timeBetweenRetries', {
    type: 'int',
    value: 100,
  });
=======
  accessor.parameter('reconnect', {
    type: 'boolean',
    value: true,
    description: "The option of whether or not to reconnect if connection is dropped." 
  });
  accessor.parameter('reconnectIntervalMilliSeconds', {
    type: 'int',
    value: 2000,
    description: "The number of milliseconds to wait before trying to reconnect from the time the connection was closed."
  });
>>>>>>> .r184
  accessor.input('toSend', {
    type: 'JSON', 
    description: 'The data to be send to the web socket server, in JSON format.'
  });
  accessor.output('connected', {
    type: 'boolean',
  });
  accessor.output('received');
}

/** Initializes accessor by attaching functions to inputs. */
exports.initialize = function() {
  client = new WebSocket.Client({
    'host':getParameter('server'),
    'port':getParameter('port'),
    'numberOfRetries':getParameter('numberOfRetries'),
    'timeBetweenRetries':getParameter('timeBetweenRetries')
  });
  client.on('open', onOpen);
  client.on('message', onMessage);
  client.on('close', onClose);
  client.on('error', function(message) {
    error(message)
  });
  //only execute once, and not when trying to reconnect. 
  if (inputHandle == null) { 
    inputHandle = addInputHandler('toSend', exports.toSendInputHandler);
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
  if (initHandle != null) {
    clearTimeout(initHandle);
  }
}
  
/** Executes once web socket closes.<br>
 *  Sets 'connected' output to false.<br>
 *  Sets reconect interval.<br>
 */
function onClose(message) {
  console.log('Status: Connection closed: ' + message);
  if (getParameter('reconnect')) {
    initHandle = setTimeout(exports.initialize, 
      getParameter('reconnectIntervalMilliSeconds'));
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
  if (initHandle != null) {
    clearTimeout(initHandle);
  }
  if (client) {
    client.removeAllListeners('open');
    client.removeAllListeners('message');
    client.removeAllListeners('close');
    client.close();
  }
}

