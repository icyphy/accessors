// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** This accessor uses the mavros ROS package to access a mavlink-based autopilot
 * such as the APM, APM2 and Px4 in order retrieve the GPS location and altitude of the drone.
 * In order to run this accessor you need a ROS distribtion (tested with indigo) and the mavros package.
 * Plug in your mavelink-based autopilot (e.g. APM2), configure the baud rate using the command "rosed mavros apm2.launch"
 * and launch the node using the command "roslaunch mavros apm2.launch". The accessor uses a websocket to access ros.
 * Thus, you need also to install rosbridge_server and launch "roslaunch rosbridge_server rosbridge_websocket.launch".
 * 
 *  @accessor robotics/DroneLocation.js
 *  @author Eloi T. Pereira (eloi@berkeley.edu)
 *  @version $$Id: DroneLocation.js 1 2016-03-06 16:00:00Z eloi $$
 *  @parameter {string} rosbridgeServer RosBridge server address  
 *  @parameter {int} rosbridgePort RosBridge server port  
 *  @output {double} lat Latitude of the drone
 *  @output {double} lon Longitude of the drone
 *  @output {double} alt Altitude of the drone
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, get, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

/** Set up the accessor by defining the inputs and outputs.
 */


exports.setup = function() {
    var sub = this.instantiate('RosSubscriber','robotics/RosSubscriber');
    var g = this.instantiate('Global2LatLonAlt','robotics/Global2LatLonAlt');

    sub.setParameter('topic',"/mavros/global_position/global");
    this.parameter('rosbridgeServer',{
	type: 'string', 
	value: 'localhost'
    });
    this.parameter('rosbridgePort',{
	type: 'int', 
	value: 9090
    });
    
    this.input('server',{'visibility': 'expert'});
    this.input('port',{'visibility': 'expert'});
    this.output('lat');
    this.output('lon');
    this.output('alt');
    this.connect('server',sub,'server');
    this.connect('port',sub,'port');
    this.connect(sub, 'received', g, 'global');
    this.connect(g, 'lat','lat');
    this.connect(g, 'lon','lon');
    this.connect(g, 'alt','alt');
};

exports.initialize = function() {
    var server = this.getParameter('rosbridgeServer').toString();
    var port = this.getParameter('rosbridgePort');
    this.send('server',server);
    this.send('port', port);
};
