// Copyright (c) 2014-2015 The Regents of the University of California.  // All rights reserved.

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

/** This accessor publishes pose information to Scarab topic /goal.<br>
 *  This accessor requires the module 'webSocketClient'. 
 *  It inherits the input and output ports from webSocketClient, and takes in
 *  pose information at 'toSend'.<br>
 *  The data published must be of the ROS datatype geometry_msgs/PoseStamped.
 *  This is formatted as the following:<pre>
 *  {
 *    "position": //cartesian coordinates
 *      {"x":.., "y":.. "z":..},
 *    "orientation": //quaternion orientation (final orientation of robot)
 *      {"w":.., "x":.., "y":.., "z":..}
 *  } </pre>
 *  The header information is added by rosbridge. <br>
 *
 *  @accessor ScarabGoalPublisher
 *  @module ScarabGoalPublisher
 *  @input {string} server The IP address or domain name of the rosbridge server.
 *  @input {number} port The port of the rosbridge server.
 *  @input {JSON} toSend The pose data to be sent to the rosbridge server.
 *  @output {boolean} connected The status of the web socket connection.
 *  @output {JSON} received The data received from the web socket server.
 *  @author Marcus Pan 
 *  @version $Id$ 
 *
*/

var wsClient = require('webSocketClient');

/** Sets up by accessor by inheriting inputs from setup() in webSocketClient.*/
exports.setup = wsClient.setup;

/** Overrides inputHandler on 'toSend' from webSocketClient.<br> 
  * New inputHandler takes in pose data and formats it according to the 
  * geometry_msgs/PoseStamped datatype in ROS. <br>
  * Inherits initialize from webSocketClient.*/ 
exports.initialize = function() {
  //must override first
  wsClient.toSendInputHandler = function() {
    var pose = get('toSend');
    var msg = {
      "header": {
        "seq": 0,
        "stamp": {
          "secs": 0,
          "nsecs": 0  
        },
        "frame_id": "map_hokuyo"    
      },
      "pose": pose
    }
    var data = {
      "op": "publish",
      "topic": "/goal",
      "msg": msg 
    }
    wsClient.sendToWebSocket(data);
  }
  wsClient.initialize();
}

/** inherits wrapup function from webSocketClient */
exports.wrapup = wsClient.wrapup;

