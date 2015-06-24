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
/** 
 * This accessor controls the Scarab movements based on arrow keypresses.
 * It takes in keypress inputs and the current position of the Scarab robot.
 * 'U' moves the robot forward, 'L' rotates left, 'R' rotates right, and
 * 'D' returns to origin.
 * It then computes and outputs the next waypoint to the Scarab.  
 * This accessor does not do any publishing or subscribing. It should take in inputs  
 * from a RosSubscriber accessor, subscribed to the topic /pose. 
 * It should output the next waypoint to a ScarabGoalPublisher accessor. 
 *
 *  @accessor ScarabArrowKeyController
 *  @input {integer} U input the number (1) when Up arrow is pressed.
 *  @input {integer} L input the number (1) when Up arrow is pressed.
 *  @input {integer} D input the number (1) when Up arrow is pressed.
 *  @input {integer} R input the number (1) when Up arrow is pressed.
 *  @input {JSON} pose Current pose of the Scarab formatted as the ROS datatype geometry_msgs/Pose. 
 *  @output {JSON} newGoal Waypoint formatted according to the ROS datatype geometry_msgs/Pose.
 *  @author Marcus Pan 
 *  @version $Id$ 
 */


//change in radius and angle for each step
var deltaRadius = 0.5;
var deltaTheta = 0.5;

//current cartesian position (w is angle) 
var px, py, pz, pw; 
//current quaternion orientation
var qx, qy, qz, qw;

var handleU, handleR, handleL, handleD;

/** Define inputs and outputs */
exports.setup = function() {
  input('U', {
    type: "int",
    value: 0
  });
  input('L', {
    type: "int",
    value: 0
  });
  input('R', {
    type: "int",
    value: 0
  });
  input('D', {
    type: "int",
    value: 0
  });
  input('pose', {
    type: "JSON",
    value: {}
  });
  output('newGoal', {
    type: "JSON"
  });
}


/** Attach function hanlders to key inputs. */
exports.initialize = function() {
  handleU = addInputHandler('U', uHandler);
  handleR = addInputHandler('R', rHandler);
  handleL = addInputHandler('L', lHandler);
  //D returns to origin
  handleD = addInputHandler('D', function() {
      sendNewGoal(0, 0, 0, 1, 0, 0, 0);
  });
}

/** Format waypoint according to ROS datatype getometry_msgs/Pose */
function sendNewGoal(px, py, pz, qw, qx, qy, qz) {
    var newGoal = {
      "position": {
        "x": px,
        "y": py,
        "z": pz 
      },
      "orientation": {
        "w": qw, 
        "x": qx, 
        "y": qy,
        "z": qz
      }
    };
    send('newGoal', newGoal);
}

/** Load global vars with current pose information. */
function getCurrentPose() {
  var currentPose = get('pose');
  if (currentPose == null) {
    console.log('null pose');
  } else {
    qw = currentPose.msg.pose.orientation.w;
    qx = currentPose.msg.pose.orientation.x;
    qy = currentPose.msg.pose.orientation.y;
    qz = currentPose.msg.pose.orientation.z;
    px = currentPose.msg.pose.position.x;
    py = currentPose.msg.pose.position.y;
    pz = currentPose.msg.pose.position.z;
    //Scarab is a ground robot, so only rotation about z-axis is understood
    if (qx != 0 || qy != 0) {
      console.err('Rotation must be about z-axis.');
    }
    //get euclidean angle (0 deg faces x-axis), theta,  of current robot orientation, 
    //based on the following formulas:
    //qw = cos(0.5*theta), qz = sin(0.5*theta)
    var theta = 2*Math.acos(qw);
    if (qw > 0) {
      if (qz > 0) pw = theta;
      else pw = -theta;
    } else {
      if (qz > 0) pw = theta;
      else pw = -theta;
    }
  }
}
/** Move forward by deltaRadius. */ 
function uHandler() { 
  if (get('U') == 1) { 
    getCurrentPose();
    sendNewGoal(px + deltaRadius*Math.cos(pw), py + deltaRadius*Math.sin(pw), 0.0, 
      qw, 0.0, 0.0, qz); 
  }
}

/** Rotate left by detlaTheta. */
function lHandler() {
  if (get('L') == 1) {
    getCurrentPose();
    var phi = 0.5*(pw + deltaTheta);
    sendNewGoal(px, py, 0.0, 
      Math.cos(phi), 0.0, 0.0, Math.sin(phi)); 
  }
}

/** Rotate right by detlaTheta. */
function rHandler() {
  if (get('R') == 1) {
    getCurrentPose();
    var phi = 0.5*(pw - deltaTheta);
    sendNewGoal(px, py, 0.0,
      Math.cos(phi),0.0, 0.0, Math.sin(phi)); 
  }
}

/** Remove input handlers. */
function wrapup() {
  removeInputHandler(handleU, 'U');
  removeInputHandler(handleR, 'R');
  removeInputHandler(handleL, 'L');
  removeInputHandler(handleD, 'D');
}


