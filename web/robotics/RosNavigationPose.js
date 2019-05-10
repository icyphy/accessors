/** Accessor for directing a ROS robot to navigate to navigation goal, expressed as
 *  a pose. This accessor is designed to work with the built in navigation stack of
 *  a Turtlebot3 Waffle, but likely works for other similar robots.
 *
 *  @accessor ROSTeleoperation
 *  @author Matt Weber
 *  @input navigationGoal A ROS pose (see http://docs.ros.org/api/geometry_msgs/html/msg/Pose.html)
 *    where the robot will be instructed to go. This accessor expects a JSON input like:
 *          {"position": { "x": -2.4949991703, "y": 0.950000107288 },
 *           "orientation": {"z": 0.266934187288, "w": 0.963714760527 }
 *    Note that this is an example of a 2D pose. Position is a Point and Orientation is
 *    a Quaternion. Orientation will be ignored if it has magnitude 0.
 *    This example has implict zero values for the "z" position and the "x", and "y" orientation
 *    properties. These may be nonzero for a 3D pose, in which case they should be included in the
 *    input. 
 *  @parameter rosbridgeServer IP address where rosbridge is running.
 *  @parameter rosbridgePort Port where rosbridge is running. By default this is 9090.
 *  @version $$Id$$
 */
// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var RosPublisher;

exports.setup = function() {

    this.input("navigationGoal", {
        "type": "JSON"
    });
    this.parameter("rosbridgeServer", {
        "type": "string",
        "value": "192.168.1.11"
    });
    this.parameter("rosbridgePort", {
        "type": "string",
        "value": "9090"
    });

    RosPublisher = this.instantiate('RosPublisher.js', 'robotics/RosPublisher');
    // FIXME: This should be a parameter?
    RosPublisher.input('server', {
        //'value': '192.168.0.103'
        'value': this.getParameter("rosbridgeServer")
    });
    RosPublisher.input('port', {
        'value': this.getParameter("rosbridgePort")
    });
    RosPublisher.setParameter('topic', "/move_base_simple/goal");
    RosPublisher.setParameter('addHeader', true);
    RosPublisher.setParameter('frame_id', "map");
    //this.connect(RosPublisher, 'received', 'data');
};

exports.initialize = function() {
    this.addInputHandler('navigationGoal', function(){
        var navGoal = this.get('navigationGoal');
        if(navGoal && navGoal.position && navGoal.orientation){
            RosPublisher.send('toSend', { "pose": navGoal});
        } else {
            error("RosNavigationPose accessor received a navigation goal with undefined values");
        }
    });
};

// exports.wrapup =function(){
//     //Reset the data display
//     this.send('data', null);
//     RosPublisher.wrapup();
//     RosSubscriber.wrapup();
// };
