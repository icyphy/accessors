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
 *  It communicates to ROS through the rosbridge web socket, and extends the 
 *  WebSocketClient accessor to do so. 
 *  It has a 'topic' parameter, that must be prefixed with a '/' eg: '/noise'.<br> 
 *
 *  @accessor RosSubscriber
 *  @parameter {string} server The IP address or domain name of server.
 *  @parameter {number} port The port that the web socket listens to.
 *  @parameter {string} topic The ROS topic to subscribe to.
 *  @output {boolean} connected The status of the web socket connection.
 *  @output {JSON} received The data received from the web socket server.
 *  @author Marcus Pan 
 *  @version $Id$ 
 *
 */


/** Sets up by accessor by inheriting inputs, outputs and parameters from setup() in WebSocketClient.<br>
 *  Adds a 'topic' input which is the ROS topic to subscribe to. */
exports.setup = function() {

   extend('WebSocketClient');

   parameter('topic', {
      type: "string",
      value: ""
   });
   
}

/** Overrides the toSendInputHandler to throw an error if called. A subscriber should not be publishing inputs. */
exports.toSendInputHandler = function() {
   console.error('This is a subscriber and does not take input to publish.');
}

/** Inherits initialize from webSocketClient.<br>
    Sends a message to rosbridge to start subscribing to the topic on input 'topic'.*/ 
exports.initialize = function() {
  Object.getPrototypeOf(exports).initialize.apply(this);

  exports.sendToWebSocket({
      "op": "subscribe",
      "topic": getParameter('topic')
  });
}

