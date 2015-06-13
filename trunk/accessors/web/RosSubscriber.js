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

/** This accessor subscribes to a ROS topic.<br>
 *  It requires the module 'webSocketClient'. 
 *  It inherits the input and output from webSocketClient, but adds
 *  its own 'topic' input.
 *  This input is usually prefixed with a '/' eg: '/noise'.<br> 
 *
 *  @accessor RosSubscriber
 *  @input {string} server The IP address or domain name of server.
 *  @input {number} port The port that the web socket listens to.
 *  @input {string} topic The ROS topic to subscribe to.
 *  @output {boolean} connected The status of the web socket connection.
 *  @output {JSON} received The data received from the web socket server.
 *  @author Marcus Pan 
 *  @version $Id$ 
 *
 */

var wsClient = require('webSocketClient');

/** Sets up by accessor by inheriting inputs and outputs from setup() in webSocketClient.<br>
 *  Adds a 'topic' input which is the ROS topic to subscribe to. */
exports.setup = function() {
  wsClient.setup();
  accessor.input('topic', {
    type: "string",
    value: "",
    description: "the ROS topic to subscribe to."
  });
}

/** Inherits initialize from webSocketClient.<br>
    Overrides the toSendInputHandler to throw an error if called. A subscriber should not be publishing inputs. <br>
    Sends a message to rosbridge to start subscribing to the topic on input 'topic'.*/ 

exports.initialize = function() {
  wsClient.toSendInputHandler = function(){
    console.error('This accessor is a subscriber and does not take input to publish.');
  }
  wsClient.initialize();
  wsClient.sendToWebSocket({
      "op": "subscribe",
      "topic": get('topic')
  });
}

/** Inherits wrapup function from webSocketClient. */
exports.wrapup = wsClient.wrapup;
