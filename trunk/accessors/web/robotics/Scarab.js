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
 *  @author Brad Campbell, Pat Pannuto
 *  @version $$Id$$
 */

var WebSocket = require('webSocket');

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function() {

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
}

var batteryClient = null;
var stateClient = null;
var locationClient = null;
var poseClient = null;
var cmdvelClient = null;
var cancelClient = null;

var seq = 0;

/** Initialize the accessor by attaching functions to inputs
 *  and opening web socket connections to RosBridge.
 */
exports.initialize = function() {

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
		s = msg.msg.status[1].message;
		charge = parseInt(s.substr(0, s.indexOf('%')));
		if (!isNaN(charge)) {
			self.send('battery', charge);
		}
	});
	batteryClient.on('error', function(message) {
		error(message)
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
	stateClient.on('error', function(message) {
		error(message)
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
	locationClient.on('error', function(message) {
		error(message)
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
	poseClient.on('error', function(message) {
		error(message)
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
	cmdvelClient.on('error', function(message) {
		error(message)
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
	cancelClient.on('error', function(message) {
		error(message)
	});
	self.addInputHandler('cancel', cancel_in.bind(this));
	cancelClient.open();
} 

var pose_in = function () {
	var v = this.get('pose');

	out = {
			op: 'publish',
			topic: this.getParameter('topicPrefix') + '/goal',
			msg: {
				'header': {
					'seq': seq++,
					'stamp': {
						'secs': 0,
						'nsecs': 0
					},
					'frame_id': 'map_hokuyo'
				},
				'pose': v
			}
	};

	poseClient.send(out);
}

var cmdvel_in = function () {
	var c = this.get('cmdvel');

	out = {
			op: 'publish',
			topic: this.getParameter('topicPrefix') + '/cmd_vel',
			msg: c
	};

	console.log('Sending over socket: ' + JSON.stringify(out));
	cmdvelClient.send(out);
}

var cancel_in = function () {
	var c = this.get('cancel');

	out = {
			op: 'publish',
			topic: this.getParameter('topicPrefix') + '/cancel',
			msg: {}
	};

	cancelClient.send(out);
}

exports.wrapup = function() {
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
}
