# Robotics Accessors

## Scarab

### Architecture

    +----------+             +-----------+        +---------+        +--------+
    |          |  websocket  |           |        |         |        |        |
    | Accessor |<----------->| RosBridge |<------>| roscore |<------>| Scarab |
    |          |             |           |        |         |        |        |
    +----------+             +-----------+        +---------+        +--------+

                                                   ROS_MASTER

### Instructions

#### Swarmbox

1. Configure `ROS_IP` and `ROS_MASTER_URI` (see more at
[ROS Documentation](http://wiki.ros.org/ROS/EnvironmentVariables)).

For example, the Swarmbox has IP address 192.168.0.111.

    $ export ROS_IP=192.168.0.111
    $ export ROS_MASTER_URI=http://192.168.0.111:11311

2. Run `roscore` and `rosbridge`.

    $ roscore
    $ roslaunch rosbridge_server rosbridge_websocket.launch

#### Scarab

1. Power it up and turn on all switches (especially the RoboClaw switch).
2. Find its IP address (`arp`, or use some discovery mechanism, currently it's
   192.168.0.103 in DOP center).
3. ssh to it with username `terraswarm` with password (not shown here).
4. Make sure `ROS_MASTER_URI` is set to the swarmbox as only a single master
   should be used in the ros network.
5. Launch the robot tasks using `roslaunch scarab dop.launch robot:=lucy
   map_file:=dop.yaml`.

The `scarab` code on the robot is in sync with
[the repository](https://github.com/nebgnahz/scarab/tree/dop).

More instructions on setting up the robot are available on the wiki:
[Configuring the scarab robot](https://www.terraswarm.org/accessors/wiki/Main/ConfiguringTheScarabRobot).
