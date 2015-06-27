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
 *  whenever a message is queued to be later sent, the accessor will stall
 *  by a number of milliseconds given by the queue size times the throttleFactor.
 *  The longer the queue, the longer the stall. Note that this will likely block
 *  the host from executing, so this feature should be used with caution.
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
 *  a string in UTF-8 that encodes a JSON object.
 *
 *  When a model with an instance of this accessor stops executing, there
 *  are two mechanisms by which data in transit can be lost. In both cases, warning
 *  messages or error messages will be issued to the host to be displayed or otherwise
 *  handled as the host sees fit.
 *  
 *  # First, there might be queued messages that were received on `toSend` but have not yet
 *    been sent, either because the socket has not yet been opened or because
 *    it was closed from the other side.
 *  # Second, a message might be received from the server after shutdown has commenced.
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
 *  @accessor WebSocketClient
 *  @module WebSocketClient
 *  @parameter {string} server The IP address or domain name of server. Defaults to 'localhost'.
 *  @parameter {int} port The port that the web socket listens to. Defaults to 8080.
 *  @parameter {int} numberOfRetries The number of times to retry if a connection fails. Defaults to 5.
 *  @parameter {int} timeBetweenRetries The time between retries in milliseconds. Defaults to 100.
 *  @parameter {boolean} reconnectOnClose The option of whether or not to reconnect when disconnected.
 *  @parameter {boolean} discardMessagesBeforeOpen If true, then any messages received on `toSend` before the socket is open will be discarded. This defaults to false.
 *  @parameter {int} throttleFactor If non-zero, specifies a time (in milliseconds) to stall when a message is queued because the socket is not yet open. The time of the stall will be the queue size (after adding the message) times the throttleFactor. This defaults to 0.
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
  parameter('discardMessagesBeforeOpen', {
    type: 'boolean',
    value: false
  });
  parameter('throttleFactor', {
    type: 'int',
    value: 0
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
    'timeBetweenRetries':getParameter('timeBetweenRetries'),
    'discardMessagesBeforeOpen':getParameter('discardMessagesBeforeOpen'),
    'throttleFactor':getParameter('throttleFactor')
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
function onMessage(message) {
   send('received', message);
}
  
/** Close the web socket connection. */
exports.wrapup = function() {
  if (inputHandle != null) {
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
}

