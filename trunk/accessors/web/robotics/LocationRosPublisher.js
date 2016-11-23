// Copyright (c) 2015-2016 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//

/** Publish location X,Y,Z coordinates as a PointCloud to a ROS topic.
 *
 *  Incoming packets should have at least these keys:
 *     {
 *       X: <x coordinate>,
 *       Y: <y coordinate>,
 *       id: <unique id for this location>
 *     }
 *
 *  All locations are published as a PointCloud so that the ROS visualization
 *  only needs to subscribe to one topic.
 *
 *  @accessor robotics/LocationRosPublisher
 *  @parameter {string} topic The ROS topic to publish to.
 *  @parameter {string} frame_id The frame_id of the header (only needed if a header is required).
 *  @author Brad Campbell
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals exports, extend, get, getParameter, parameter  */
/*jshint globalstrict: true*/
'use strict';

var ROS_TYPE = 'sensor_msgs/PointCloud';

// location_id -> {position: {X, Y, Z}, color: <some color as a float>}
var locations = {};

/** Sets up by accessor by inheriting inputs from setup() in
 * WebSocketClient. Adds additional parameters regarding the ROS topic
 * to publish to.
 */
exports.setup = function () {
    this.extend('net/WebSocketClient');
    this.parameter('topic', {
        type: "string"
    });
    this.parameter('frame_id', {
        type: "string",
        value: ""
    });
};

/**  Inherits initialize from WebSocketClient.
 *   Advertise the topic we are publishing to.
 */
exports.initialize = function () {
    this.exports.ssuper.initialize.call(this);
};

/** Override onOpen from WebSocketClient */
exports.onOpen = function () {
    this.exports.ssuper.onOpen.call(this);

    // Advertise what we have when the websocket opens.
    var advertise = {
        "op": "advertise",
        "topic": this.getParameter('topic'),
        "type": ROS_TYPE
    };
    this.exports.sendToWebSocket.call(this, advertise);
};

function random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '0x';
    for (var i = 0; i < 6; i += 1) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return parseInt(color, 16);
}

/** Override inputHandler on 'toSend' from WebSocketClient. */
exports.toSendInputHandler = function () {
    var msg = this.get('toSend');

    // Update the current location map with this incoming packet
    var id = msg.id;
    var x = msg.X || 0;
    var y = msg.Y || 0;
    var z = msg.Z || 0;

    // Check if this ID already has a color
    var color = 0.0;
    if (id in locations) {
        color = locations[id].color;
    } else {
        color = random_color();
    }

    // Actually update the record
    locations[id] = {
        position: {
            x: x,
            y: y,
            z: z
        },
        color: color
    };

    // Create arrays we can publish
    var location_points = [];
    var colors = [];
    Object.keys(locations).forEach(function (key) {
        location_points.push(locations[key].position);
        colors.push(locations[key].color);
    });

    var out = {
        header: {
            frame_id: this.getParameter('frame_id')
        },
        points: location_points,
        channels: [{
            name: 'rgb',
            values: colors
        }]
    };

    var data = {
        "op": "publish",
        "topic": this.getParameter('topic'),
        "msg": out
    };

    exports.sendToWebSocket(data);
};

/** Unadvertise the topic and inherit wrapup from WebSocketClient. */
exports.wrapup = function () {
    if (this.exports.isOpen()) {
        var unadvertise = {
            "op": "unadvertise",
            "topic": this.getParameter('topic')
        };
        this.exports.sendToWebSocket.call(this, unadvertise);
    }
    this.exports.ssuper.wrapup.call(this);
};
