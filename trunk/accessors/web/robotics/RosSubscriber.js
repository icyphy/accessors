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

/** This accessor subscribes to a pre-established ROS topic.<br>
 *  It communicates to ROS through the rosbridge web socket, and extends the 
 *  WebSocketClient accessor to do so. 
 *  It has a 'topic' parameter, that must be prefixed with a '/' eg: '/noise'.<br>. 
 *  The other parameters configure how the data is to be received according to the rosbridge specification:
 *  https://github.com/RobotWebTools/rosbridge_suite/blob/develop/ROSBRIDGE_PROTOCOL.md#344-subscribe
 *
 *  @accessor robotics/RosSubscriber
 *  @parameter {string} topic The ROS topic to subscribe to.
 *  @parameter {int} throttle_rate The minimum amount of time (in ms) that must elapse between messages sent. Defaults to 0.
 *  @parameter {int} queue_length The ROS size of the queue to buffer messages. Messages are buffered as a result of the throttle_rate. Defaults to 1.
 *  @parameter {int} fragment_size The maximum size that a message can take before it is to be fragmented. Defaults to 1000. Ptolemy will close the model if fragment size is too large (not sure what the maximum is).
 *  @parameter {string} compression A string to specify the compression scheme to be used on messages. Options are "none" (default) and "png". 
 *  @output {boolean} connected The status of the web socket connection.
 *  @output {JSON} received The data received from the web socket server.
 *  @author Marcus Pan 
 *  @version $Id$ 
 *
 */


/** Sets up by accessor by inheriting inputs, outputs and parameters from setup() in WebSocketClient.<br>
 *  Adds a 'topic' input which is the ROS topic to subscribe to. */
exports.setup = function() {

   extend('net/WebSocketClient');

   parameter('topic', {
      type: "string",
      value: ""
   });
   parameter('throttle_rate', {
      type: "int",
      value: 0
   });
   parameter('queue_length', {
      type: "int",
      value: 10
   });
   parameter('fragment_size', {
      type: "int",
      value: 10000
   });
   parameter('compression', {
      type: "string",
      value: 'none'
   });
   
}

/** Overrides the toSendInputHandler to throw an error if called. A subscriber should not be publishing inputs. */
exports.toSendInputHandler = function() {
   console.error('This is a subscriber and does not take input to publish.');
}

/** Inherits initialize from webSocketClient.<br>
    Sends a message to rosbridge to start subscribing to the topic on input 'topic'.*/ 
exports.initialize = function() {
  this.ssuper.initialize.apply(this);

  exports.sendToWebSocket({
      "op": "subscribe",
      "topic": getParameter('topic'),
      "throttle_rate": getParameter('throttle_rate'),
      "queue_length": getParameter('queue_length'),
      "fragment_size": getParameter('fragment_size'),
      "compression": getParameter('compression')
  });
}

/** Unsubscribe from the topic. Close websocket connections by calling wrapup of WebSocketClient */
exports.wrapup = function() {
   var unsubscribe = {
      "op": "unsubscribe",
      "topic": getParameter('topic')
   }
   exports.sendToWebSocket(unsubscribe);
   this.ssuper.wrapup();
}

