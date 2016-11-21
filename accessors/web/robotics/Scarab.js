// Copyright (c) 2015 The Regents of the University of California
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

/** This accessor exposes a subset of commands and sensor data
 *  for a type of robot called a "Scarab" created by Prof. Vijay Kumar's
 *  group at the University of Pennsylvannia (see [1]).
 *  This accessor communicates with the robot through a websocket connection
 *  to ROS, the Robotic Operating System, using a websocket interface
 *  for ROS called ROSBridge.
 *
 *  This accessor requires very specific hardware. In the usual configuration,
 *  the ROS core and ROS bridge are executed on a SwarmBox, and robot itself
 *  operates as a ROS client.  The ROS bridge provides a websocket that can
 *  be used to publish and subscribe to ROS events.
 *
 *  Following are instructions for running this accessor in the DOP Center
 *  setup at Berkeley:
 *
 *  1. Get your laptop on the SwarmMaster network, hosted by a SwarmBox.
 *  2. Connect to the Swarmbox using ssh.  E.g.:
 *        ssh -l sbuser 192.168.0.111
 *     You will need a password.
 *  3. Start screen on the swarmbox:
 *        screen
 *  4. Run the ROS core:
 *        roscore
 *  5. Create a new "window" in screen:
 *        Ctrl-A C
 *  6. Run the ROS bridge:
 *        roslaunch rosbridge_server rosbridge_websocket.launch
 *  7. Detach from screen:
 *        Ctrl-A D
 *
 *
 *  ROSBridge on Swarmbox will be running at IP 192.168.0.111, port 9090.
 *
 *  You can now log off from the swarmbox.  To stop the ROS core and bridge
 *  on the SwarmBox later, you can:
 *
 *  1. Connect to the Swarmbox using ssh, as above.
 *  2. Resume screen on the swarmbox:
 *        screen -r
 *  3. Stop the program:
 *        Ctrl-C
 *  4. End the "window":
 *        Ctrl-D
 *  5. Repeat for all screen windows.
 *
 *
 *  Next, set up the robot. The DOP center robot is Lucy, and the ROS prefix
 *  for pub/sub is "/scarab/lucy".
 *
 *  1. Power on the robot (all switches and one push button).
 *  2. Find the robot's IP address. You can use the Discovery swarmlet or
 *     command-line tools. The DOP center robot Lucy has mac address
 *     "4:f0:21:3:6:9".
 *  3. Connect to the robot using ssh: e.g., assuming the IP address is 192.168.0.105,
 *        ssh 192.168.0.105 -l terraswarm
 *  4. Enter the password.
 *  5. Start screen:
 *        screen
 *  6. Tell the robot it's IP address:
 *        export ROS_IP=192.168.0.105
 *  7. Launch the ROS client:
 *        roslaunch scarab dop.launch robot:=lucy map_file:=dop.yaml
 *  8. Detach from screen and log off (if you like):
 *       Ctrl-A D
 *
 *
 *  References
 *  ----------
 *
 *  1. Nathan Michael, Michael M. Zavlanos, Vijay Kumar, and George J. Pappas,
 *     Distributed Multi-Robot Task Assignment and Formation Control,
 *     IEEE International Conference on Robotics and Automation (ICRA),
 *     Pasadena, CA, USA, May 19-23, 2008.
 *     DOI: 10.1109/ROBOT.2008.4543197
 *
 *  @accessor robotics/Scarab
 *  @input {array<{position: {x: 0, y: 0, z: 0}, orientation: {x: 0, y: 0, z: 0, w: 0}}>} pose
 *   Send the robot to a location with a given orientation,
 *   where orientation is a quaternion.
 *  @input {array<{linear: {x: 0, y: 0, z: 0}, angular: {x: 0, y: 0, z: 0}}>} cmdvel
 *   Low-level control for the wheel motors.
 *   To drive the robot straight forward and backward, set the linear.x property
 *   to a value between -1.0 (backwards) and 1.0 (forwards). To turn the robot,
 *   set the angular.z property to a value between -1.0 and 1.0. Both can be
 *   to steer the robot while it drives forward or backward. The other properties
 *   are ignored. Note that this interface is not recommended for normal
 *   operation. In the general case, only `pose` should be used to direct the
 *   robot.
 *  @input cancel Upon receiving any message, cancel the robot's current
 *   navigation goal. This will cause the robot to stop.
 *
 *  @output battery The percentage of battery remaining.
 *  @output state The current state of the robot's navigation algorithm. It can
 *   be one of 'idle', 'navigating', or 'stuck'. If the robot is 'idle' it
 *   is currently not trying to navigate to any pose. In 'navigating' state,
 *   the robot is actively trying to reach a desired pose goal. If the robot
 *   is unable to find a path to the goal (beacuse there were obsticals in the
 *   way), it will enter the 'stuck' state.
 *  @output location The "pose" type of where the robot currently is. See the
 *   input "pose" for a description of the format.
 *
 *  @parameter server The IP address of the ROS bridge, e.g. '192.168.0.111'.
 *  @parameter port The port used by the ROS bridge web socket, e.g. 9090.
 *  @parameter topicPrefix The identifier for the robot, e.g. '/scarab/lucy'.
 *
 *  @author Brad Campbell, Pat Pannuto. Contributor: Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var WebSocket = require('webSocket');

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function () {

    this.input('pose');
    this.input('cmdvel');
    this.input('cancel');

    this.output('battery', {
        type: 'int'
    });
    this.output('state', {
        type: 'string'
    });
    this.output('location');

    this.parameter('server', {
        type: 'string',
        value: 'localhost'
    });
    this.parameter('port', {
        type: 'int',
        value: 8080
    });
    this.parameter('topicPrefix', {
        type: 'string',
        value: '/scarab/lucy'
    });
};

var batteryClient = null;
var stateClient = null;
var locationClient = null;
var poseClient = null;
var cmdvelClient = null;
var cancelClient = null;

var seq = 0;

var pose_in = function () {
    var v = this.get('pose'),
        out = {
            op: 'publish',
            topic: this.getParameter('topicPrefix') + '/goal',
            msg: {
                'header': {
                    'seq': seq,
                    'stamp': {
                        'secs': 0,
                        'nsecs': 0
                    },
                    'frame_id': 'map_hokuyo'
                },
                'pose': v
            }
        };
    seq += 1;
    poseClient.send(out);
};

var cmdvel_in = function () {
    var c = this.get('cmdvel'),
        out = {
            op: 'publish',
            topic: this.getParameter('topicPrefix') + '/cmd_vel',
            msg: c
        };

    console.log('Sending over socket: ' + JSON.stringify(out));
    cmdvelClient.send(out);
};

var cancel_in = function () {
    var c = this.get('cancel'),
        out = {
            op: 'publish',
            topic: this.getParameter('topicPrefix') + '/cancel',
            msg: {}
        };

    cancelClient.send(out);
};

/** Initialize the accessor by attaching functions to inputs
 *  and opening web socket connections to RosBridge.
 */
exports.initialize = function () {

    var self = this;

    // Retreive the current battery charge status
    batteryClient = new WebSocket.Client({
        host: self.getParameter('server'),
        port: self.getParameter('port')
    });
    batteryClient.on('open', function () {
        // Subscribe to /scarab/name/diagnostics
        batteryClient.send({
            op: "subscribe",
            topic: self.getParameter('topicPrefix') + '/diagnostics'
        });
    });
    batteryClient.on('message', function (msg) {
        // Quick hack to find the charge of the battery.
        // Ideally this would be done in some better way, but this is all we
        // need for now.
        var s = msg.msg.status[1].message,
            charge = parseInt(s.substr(0, s.indexOf('%')), 10);
        if (!isNaN(charge)) {
            self.send('battery', charge);
        }
    });
    batteryClient.on('error', function (message) {
        error(message);
    });
    batteryClient.open();

    // Keep track of what the robot is doing
    stateClient = new WebSocket.Client({
        host: self.getParameter('server'),
        port: self.getParameter('port')
    });
    stateClient.on('open', function () {
        // Subscribe to /scarab/name/diagnostics
        stateClient.send({
            op: "subscribe",
            topic: self.getParameter('topicPrefix') + '/state'
        });
    });
    stateClient.on('message', function (msg) {
        // one of: IDLE, BUSY, STUCK, FAILED
        self.send('state', msg.msg.state);
    });
    stateClient.on('error', function (message) {
        error(message);
    });
    stateClient.open();

    // Get location updates from the robot
    locationClient = new WebSocket.Client({
        host: self.getParameter('server'),
        port: self.getParameter('port')
    });
    locationClient.on('open', function () {
        // Subscribe to /scarab/name/pose
        locationClient.send({
            op: "subscribe",
            topic: self.getParameter('topicPrefix') + '/pose'
        });
    });
    locationClient.on('message', function (msg) {
        self.send('location', msg.msg.pose);
    });
    locationClient.on('error', function (message) {
        error(message);
    });
    locationClient.open();

    // Send poses to the robot
    poseClient = new WebSocket.Client({
        host: self.getParameter('server'),
        port: self.getParameter('port')
    });
    poseClient.on('open', function () {
        poseClient.send({
            op: 'advertise',
            topic: self.getParameter('topicPrefix') + '/goal',
            type: 'geometry_msgs/PoseStamped'
        });
    });
    poseClient.on('error', function (message) {
        error(message);
    });
    self.addInputHandler('pose', pose_in.bind(self));
    poseClient.open();

    // Send cmd_vel to the robot
    cmdvelClient = new WebSocket.Client({
        host: self.getParameter('server'),
        port: self.getParameter('port')
    });
    cmdvelClient.on('open', function () {
        var advertise = {
            op: 'advertise',
            topic: self.getParameter('topicPrefix') + '/cmd_vel',
            type: 'geometry_msgs/Twist'
        };
        cmdvelClient.send(advertise);
        console.log('Sending over socket: ' + JSON.stringify(advertise));
    });
    cmdvelClient.on('error', function (message) {
        error(message);
    });
    self.addInputHandler('cmdvel', cmdvel_in.bind(self));
    cmdvelClient.open();

    // Send cancel to the robot
    cancelClient = new WebSocket.Client({
        host: self.getParameter('server'),
        port: self.getParameter('port')
    });
    cancelClient.on('open', function () {
        cancelClient.send({
            op: 'advertise',
            topic: self.getParameter('topicPrefix') + '/cancel',
            type: 'std_msgs/Empty'
        });
    });
    cancelClient.on('error', function (message) {
        error(message);
    });
    self.addInputHandler('cancel', cancel_in.bind(this));
    cancelClient.open();
};


exports.wrapup = function () {
    if (stateClient) {
        stateClient.close();
    }
    if (batteryClient) {
        batteryClient.close();
    }
    if (locationClient) {
        locationClient.close();
    }
    if (poseClient) {
        poseClient.send({
            op: 'unadvertise',
            topic: this.getParameter('topicPrefix') + '/goal'
        });
        poseClient.close();
    }
    if (cmdvelClient) {
        // Stop the robot, then unadvertise.
        var zeroVelocity = {
            linear: {
                x: 0,
                y: 0,
                z: 0
            },
            angular: {
                x: 0,
                y: 0,
                z: 0
            }
        },
            out = {
                op: 'publish',
                topic: this.getParameter('topicPrefix') + '/cmd_vel',
                msg: zeroVelocity
            };
        cmdvelClient.send(out);

        cmdvelClient.send({
            op: 'unadvertise',
            topic: this.getParameter('topicPrefix') + '/cmd_vel'
        });
        cmdvelClient.close();
    }
    if (cancelClient) {
        cancelClient.send({
            op: 'unadvertise',
            topic: this.getParameter('topicPrefix') + '/cancel'
        });
        cancelClient.close();
    }
};
