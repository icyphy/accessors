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

/** This accessor publishes to a pre-defined ROS topic.<br>
 *  This accessor requires the module 'webSocketClient'. 
 *  It inherits the input and output from webSocketClient, but adds
 *  its own 'topic' input. This must be a pre-established topic in ROS.
 *  This input is usually prefixed with a '/' eg: '/noise'.<br> 
 *  On input from 'toSend', this accessor publishes that input to the 
 *  aforementioned topic. 
 *  The input from 'toSend' must be in JSON form, and must match the message
 *  datatype that the ROS topic is expecting. For example if ROS topic is 
 *  expecting <code>std_msgs/String</code>, then the input in 'toSend' should be
 *  as follows:
 *  <pre> { "data": "hello world" } </pre>
 *
 *  @accessor RosPublisher
 *  @parameter {string} server The IP address or domain name of server.
 *  @parameter {number} port The port that the web socket listens to.
 *  @parameter {string} topic The ROS topic to publish to.
 *  @input {JSON} toSend The data to be published to the topic.
 *  @output {boolean} connected The status of the web socket connection.
 *  @output {JSON} received The data received from the web socket server.
 *  @author Marcus Pan 
 *  @version $Id$ 
 */

var wsClient = require('webSocketClient');

/** Sets up by accessor by inheriting inputs from setup() in webSocketClient.<br>
 *  Adds a 'topic' input which is a pre-defined ROS topic to publish to.*/ 
exports.setup = function() {
  wsClient.setup();
  parameter('topic', {
    type: "string",
    value: ""
  });
}

/** Overrides inputHandler on 'toSend' from webSocketClient.<br> 
 *  Inherits initialize from webSocketClient.*/ 
exports.initialize = function() {
//must override first before initializing
  wsClient.toSendInputHandler = function() {
    var data = {
      "op": "publish",
      "topic": getParameter('topic'),
      "msg": get('toSend') 
    }
    wsClient.sendToWebSocket(data);
  }

  wsClient.initialize();
}

/** inherits wrapup function from webSocketClient */
exports.wrapup = wsClient.wrapup;

