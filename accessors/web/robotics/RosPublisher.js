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

/** This accessor advertises and publishes to a ROS topic. It extends the WebSocketClient to communicate to a rosbridge websocket. <br>
 * During intialize, it will advertise the  topic it will publish to, along with its type. The purpose of 'advertise' here is to establish the ROS topic if isn't already established. This is slightly different from the 'advertise' function in NodeHandle which simply publicizes that the the node will be publishing messages to the topic. 
 * <li>If the topic does not already exist, and the type is valid, a topic will be established with this type.</li> 
 * <li>If the topic already exists with a different type, no new topic will be established
 * <li>If the topic already exists with the same type, no new topic will be established.</li> 
 * <li>If the topic already exists but the type isn't resolved, no new topic will be established.</li>
 *  On input from 'toSend', this accessor publishes that input to the 
 *  aforementioned topic. 
 *  The input from 'toSend' must be in JSON form, and must match the message
 *  datatype that the ROS topic is expecting. For example if ROS topic is 
 *  expecting <code>std_msgs/String</code>, then the input in 'toSend' should be
 *  as follows:
 *  <pre> { "data": "hello world" } </pre>
 *  Some ROS types contain a header which consists of a sequence, timestamp, and a frame_id. If the ROS type has a header, you can either:
 *  <li>send the message on toSend without the header, and check the parameter 'addHeader'. This sends the message with a header with only the frame_id specified, and rosbridge will add the sequence and timestamp for you. 
 *  <li>send a fully formed message with all fields in the header included and don't check the parameter 'addHeader'.</li> 
 *  This accessor doesn't do any error checking. All error messages orginate from rosbridge and will appear on the console running rosbridge. More information ccan be viewed on the <a href='https://github.com/RobotWebTools/rosbridge_suite/blob/groovy-devel/ROSBRIDGE_PROTOCOL.md'>rosbridge protocol specification</a> site.
 *
 *  @accessor RosPublisher
 *  @parameter {string} topic The ROS topic to publish to.
 *  @parameter {string} ROStype The ROS datatype of the topic.
 *  @parameter {boolean} addHeader If (true), this accessor will send a header with a blank seq and timestamp field, and rosbridge will add the header for you.
 *  @parameter {string} frame_id The frame_id of the header (only needed if a header is required).
 *  @author Marcus Pan 
 *  @version $Id$ 
 */


/** Sets up by accessor by inheriting inputs from setup() in WebSocketClient. Adds additional parameters regarding the ROS topic to publish to. */ 
exports.setup = function() {
   extend('WebSocketClient');
   parameter('topic', {
      type: "string"
   });
   parameter('ROStype', {
      type: "string"
   });
   parameter('addHeader', {
      type: "boolean",
      value: false
   });
   parameter('frame_id', {
      type: "string",
      value: ""
   });
}

/** Override inputHandler on 'toSend' from WebSocketClient */
exports.toSendInputHandler = function() {
   var msg = get('toSend');
//add a header with a blank time and sequence info. This will be added by rosbridge.
   if (getParameter('addHeader')) {
      msg.header = {
         "frame_id": getParameter('frame_id')
      };
   }
      
   var data = {
      "op": "publish",
      "topic": getParameter('topic'),
      "msg": msg 
   }

   exports.sendToWebSocket(data);
}

/**  Inherits initialize from WebSocketClient. 
 *   Advertise the topic we are publishing to.*/ 
exports.initialize = function() {
   this.ssuper.initialize.apply(this);

   var advertise = {
      "op": "advertise",
      "topic": getParameter('topic'),
      "type": getParameter('ROStype')
   };
   exports.sendToWebSocket(advertise);
   
}

/** Unadvertise the topic and inherit wrapup from WebSocketClient */
exports.wrapup = function() {
   var unadvertise = {
      "op": "unadvertise",
      "topic": getParameter('topic')
   };
   exports.sendToWebSocket(unadvertise);
   this.ssuper.wrapup();
}


